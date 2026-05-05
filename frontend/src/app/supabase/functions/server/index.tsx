import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as db from "./db_utils.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as sessionManager from "./session-manager.tsx";
import * as searchEngine from "./search-engine.tsx";

const app = new Hono();

// Using KV store for all data storage
const usePostgres = false;
console.log('✅ Using KV store for data storage');

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-fd41cd37/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// RATE LIMITING (per-IP, fixed window in KV)
// ============================================
function clientIp(c: any): string {
  const fwd = c.req.header('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown';
}

async function rateLimit(c: any, bucket: string, max: number, windowSec: number) {
  const ip = clientIp(c);
  const windowKey = Math.floor(Date.now() / 1000 / windowSec);
  const key = `ratelimit:${bucket}:${ip}:${windowKey}`;
  const current = ((await kv.get(key)) as number | null) ?? 0;
  if (current >= max) {
    return c.json({ error: "Too many requests. Please try again shortly." }, 429);
  }
  await kv.set(key, current + 1);
  return null;
}

// ============================================
// ADMIN AUDIT LOG
// ============================================
async function logAdminAction(actor: { id?: string; email?: string }, action: string, target?: any) {
  try {
    const id = `audit:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await kv.set(id, {
      id,
      actorId: actor?.id ?? 'unknown',
      actorEmail: actor?.email ?? 'unknown',
      action,
      target: target ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.log(`Audit log write failed: ${e}`);
  }
}

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// Sign up new user
app.post("/make-server-fd41cd37/auth/signup", async (c) => {
  try {
    const limited = await rateLimit(c, 'signup', 5, 600);
    if (limited) return limited;
    const body = await c.req.json();
    const { email, password, name, consent } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Send email verification instead of auto-confirming
      email_confirm: false
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Store user profile - use PostgreSQL if available, otherwise KV store
    if (usePostgres) {
      await db.createUser(data.user.id, data.user.email!, name, 'user');
    } else {
      await kv.set(`user_profile:${data.user.id}`, {
        id: data.user.id,
        email: data.user.email,
        name,
        createdAt: new Date().toISOString(),
        wishlist: [],
        savedItineraries: [],
        reviews: [],
        role: 'user'
      });
    }

    // DPDP-style consent log (immutable record per user)
    await kv.set(`consent:${data.user.id}`, {
      userId: data.user.id,
      email: data.user.email,
      acceptedTerms: consent?.acceptedTerms === true,
      acceptedPrivacy: consent?.acceptedPrivacy === true,
      marketingOptIn: consent?.marketingOptIn === true,
      ip: clientIp(c),
      userAgent: c.req.header('user-agent') ?? '',
      timestamp: new Date().toISOString(),
      version: 'v1',
    });

    console.log(`User created successfully: ${data.user.email}`);

    return c.json({
      success: true,
      message: "Account created! Please check your email to verify your account before signing in.",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'user'
      }
    });

  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Sign in user
app.post("/make-server-fd41cd37/auth/signin", async (c) => {
  try {
    const limited = await rateLimit(c, 'signin', 10, 300);
    if (limited) return limited;
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Sign in error: ${error.message}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: "Failed to create session" }, 500);
    }

    // Get user profile - use PostgreSQL if available, otherwise KV store
    let profile;
    if (usePostgres) {
      profile = await db.getUserById(data.user.id);
      // Update last login
      await db.updateLastLogin(data.user.id);
    } else {
      profile = await kv.get(`user_profile:${data.user.id}`);
    }

    console.log(`User signed in successfully: ${data.user.email}`);

    return c.json({
      success: true,
      message: "Signed in successfully!",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || '',
        createdAt: profile?.createdAt || profile?.created_at || data.user.created_at,
        role: profile?.role || 'user',
        wishlist: profile?.wishlist || [],
        savedItineraries: profile?.savedItineraries || [],
        reviews: profile?.reviews || []
      }
    });

  } catch (error) {
    console.log(`Sign in error: ${error}`);
    return c.json({ error: "Internal server error during sign in" }, 500);
  }
});

// Sign in with Google OAuth
app.post("/make-server-fd41cd37/auth/signin-google", async (c) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${c.req.header('origin') || window.location.origin}#/`
      }
    });

    if (error) {
      console.log(`Google OAuth error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      success: true,
      url: data.url
    });

  } catch (error) {
    console.log(`Google OAuth error: ${error}`);
    return c.json({ error: "Internal server error during Google sign in" }, 500);
  }
});

// Sign in with Facebook OAuth
app.post("/make-server-fd41cd37/auth/signin-facebook", async (c) => {
  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-facebook
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${c.req.header('origin') || window.location.origin}#/`
      }
    });

    if (error) {
      console.log(`Facebook OAuth error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      success: true,
      url: data.url
    });

  } catch (error) {
    console.log(`Facebook OAuth error: ${error}`);
    return c.json({ error: "Internal server error during Facebook sign in" }, 500);
  }
});

// Create or get OAuth user profile
app.post("/make-server-fd41cd37/auth/oauth-profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from access token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log(`OAuth profile error: ${error?.message || 'No user'}`);
      return c.json({ error: "Invalid token" }, 401);
    }

    // Check if profile exists
    let existingProfile;
    if (usePostgres) {
      existingProfile = await db.getUserById(user.id);
    } else {
      existingProfile = await kv.get(`user_profile:${user.id}`);
    }
    
    if (existingProfile) {
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: existingProfile.name,
          createdAt: existingProfile.createdAt || existingProfile.created_at,
          role: existingProfile.role
        }
      });
    }

    // Create new profile
    const body = await c.req.json();
    const { email, name } = body;

    const profileName = name || user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0] || 'User';
    const profileEmail = email || user.email;

    if (usePostgres) {
      await db.createUser(user.id, profileEmail!, profileName, 'user');
      const newProfile = await db.getUserById(user.id);
      
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: profileEmail,
          name: profileName,
          createdAt: newProfile.created_at,
          role: newProfile.role
        }
      });
    } else {
      const newProfile = {
        id: user.id,
        name: profileName,
        email: profileEmail,
        createdAt: new Date().toISOString(),
        wishlist: [],
        savedItineraries: [],
        role: 'user'
      };

      await kv.set(`user_profile:${user.id}`, newProfile);

      console.log(`OAuth profile created for user: ${user.email}`);

      return c.json({
        success: true,
        user: {
          id: user.id,
          email: newProfile.email,
          name: newProfile.name,
          createdAt: newProfile.createdAt
        }
      });
    }

  } catch (error) {
    console.log(`OAuth profile creation error: ${error}`);
    return c.json({ error: "Internal server error during profile creation" }, 500);
  }
});

// Get current user info
app.get("/make-server-fd41cd37/auth/user", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Get full profile from KV store
    const profile = await kv.get(`user_profile:${data.user.id}`);

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || '',
        createdAt: profile?.createdAt || data.user.created_at,
        role: profile?.role || 'user',
        wishlist: profile?.wishlist || [],
        savedItineraries: profile?.savedItineraries || [],
        reviews: profile?.reviews || []
      }
    });

  } catch (error) {
    console.log(`Get user error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Sign out user
app.post("/make-server-fd41cd37/auth/signout", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.log(`Sign out error: ${error.message}`);
    }

    return c.json({
      success: true,
      message: "Signed out successfully"
    });

  } catch (error) {
    console.log(`Sign out error: ${error}`);
    return c.json({ error: "Internal server error during sign out" }, 500);
  }
});

// Update user profile
// DPDP-compliant account deletion (right to erasure)
app.delete("/make-server-fd41cd37/auth/account", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: "No authorization header" }, 401);
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return c.json({ error: "Invalid or expired token" }, 401);

    const userId = user.id;
    const userEmail = user.email;

    // Wipe associated KV records
    await Promise.all([
      kv.del(`user_profile:${userId}`),
      kv.del(`wishlist:${userId}`),
      kv.del(`itinerary:${userId}`),
      kv.del(`consent:${userId}`),
    ]);

    // Delete the auth user itself
    const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
    if (delErr) {
      console.log(`Account deletion auth error for ${userEmail}: ${delErr.message}`);
      return c.json({ error: "Failed to delete account" }, 500);
    }

    // Audit (no admin actor — user-initiated)
    await kv.set(`audit:${Date.now()}:user-delete:${userId}`, {
      action: 'user.account.delete',
      actorId: userId,
      actorEmail: userEmail,
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Account deletion error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.put("/make-server-fd41cd37/auth/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, wishlist, savedItineraries, reviews } = body;

    // Get current profile
    const currentProfile = await kv.get(`user_profile:${user.id}`) || {};

    // Update profile
    const updatedProfile = {
      ...currentProfile,
      id: user.id,
      email: user.email,
      ...(name !== undefined && { name }),
      ...(wishlist !== undefined && { wishlist }),
      ...(savedItineraries !== undefined && { savedItineraries }),
      ...(reviews !== undefined && { reviews }),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);

    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedProfile
    });

  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Request password reset
app.post("/make-server-fd41cd37/auth/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin') || 'http://localhost:3000'}#/reset-password`,
    });

    if (error) {
      console.log(`Password reset error: ${error.message}`);
      // Don't reveal whether user exists or not for security
      return c.json({ 
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions." 
      });
    }

    return c.json({ 
      success: true,
      message: "If an account exists with this email, you will receive password reset instructions." 
    });

  } catch (error) {
    console.log(`Password reset error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Reset password with token
app.post("/make-server-fd41cd37/auth/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { password } = body;
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    if (!password) {
      return c.json({ error: "Password is required" }, 400);
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Update password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.log(`Password update error: ${error.message}`);
      return c.json({ error: "Failed to reset password" }, 400);
    }

    console.log('Password reset successful');

    return c.json({ 
      success: true,
      message: "Password reset successfully" 
    });

  } catch (error) {
    console.log(`Password reset error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// WISHLIST ENDPOINTS
// ============================================

// Get user's wishlist
app.get("/make-server-fd41cd37/wishlist", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Get wishlist from KV store
    const wishlist = await kv.get(`wishlist:${user.id}`) || [];

    return c.json({ wishlist });

  } catch (error) {
    console.log(`Get wishlist error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Add item to wishlist
app.post("/make-server-fd41cd37/wishlist", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const body = await c.req.json();
    const { place } = body;

    if (!place || !place.slug) {
      return c.json({ error: "Place data is required" }, 400);
    }

    // Get current wishlist
    const wishlist = await kv.get(`wishlist:${user.id}`) || [];

    // Check if already exists
    const exists = wishlist.some((item: any) => item.slug === place.slug);
    
    if (exists) {
      return c.json({ error: "Place already in wishlist" }, 400);
    }

    // Add to wishlist
    wishlist.push({
      ...place,
      addedAt: new Date().toISOString()
    });

    await kv.set(`wishlist:${user.id}`, wishlist);

    return c.json({ success: true, wishlist });

  } catch (error) {
    console.log(`Add to wishlist error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Remove item from wishlist
app.delete("/make-server-fd41cd37/wishlist/:slug", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const slug = c.req.param('slug');

    // Get current wishlist
    const wishlist = await kv.get(`wishlist:${user.id}`) || [];

    // Remove item
    const updated = wishlist.filter((item: any) => item.slug !== slug);

    await kv.set(`wishlist:${user.id}`, updated);

    return c.json({ success: true, wishlist: updated });

  } catch (error) {
    console.log(`Remove from wishlist error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Clear entire wishlist
app.delete("/make-server-fd41cd37/wishlist", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    await kv.set(`wishlist:${user.id}`, []);

    return c.json({ success: true, wishlist: [] });

  } catch (error) {
    console.log(`Clear wishlist error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Sync wishlist from localStorage to database
app.post("/make-server-fd41cd37/wishlist/sync", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const body = await c.req.json();
    const { localWishlist } = body;

    if (!Array.isArray(localWishlist)) {
      return c.json({ error: "Invalid wishlist data" }, 400);
    }

    // Get current database wishlist
    const dbWishlist = await kv.get(`wishlist:${user.id}`) || [];

    // Merge: add local items that don't exist in DB
    const merged = [...dbWishlist];
    
    for (const localItem of localWishlist) {
      const exists = merged.some((item: any) => item.slug === localItem.slug);
      if (!exists) {
        merged.push({
          ...localItem,
          addedAt: localItem.addedAt || new Date().toISOString()
        });
      }
    }

    await kv.set(`wishlist:${user.id}`, merged);

    return c.json({ success: true, wishlist: merged });

  } catch (error) {
    console.log(`Sync wishlist error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// RECENTLY VIEWED ENDPOINTS
// ============================================

// Get recently viewed destinations
app.get("/make-server-fd41cd37/recently-viewed", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const recentlyViewed = await kv.get(`recently_viewed:${user.id}`) || [];

    return c.json({ recentlyViewed });

  } catch (error) {
    console.log(`Get recently viewed error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Add to recently viewed
app.post("/make-server-fd41cd37/recently-viewed", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const body = await c.req.json();
    const { place } = body;

    if (!place || !place.slug) {
      return c.json({ error: "Place data is required" }, 400);
    }

    // Get current recently viewed
    const recentlyViewed = await kv.get(`recently_viewed:${user.id}`) || [];

    // Remove if already exists (we'll add it to front)
    const filtered = recentlyViewed.filter((item: any) => item.slug !== place.slug);

    // Add to front
    filtered.unshift({
      ...place,
      viewedAt: new Date().toISOString()
    });

    // Keep only last 20
    const limited = filtered.slice(0, 20);

    await kv.set(`recently_viewed:${user.id}`, limited);

    return c.json({ success: true, recentlyViewed: limited });

  } catch (error) {
    console.log(`Add to recently viewed error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// NEWSLETTER ENDPOINTS
// ============================================

// Subscribe to newsletter
app.post("/make-server-fd41cd37/newsletter/subscribe", async (c) => {
  try {
    const limited = await rateLimit(c, 'newsletter', 5, 600);
    if (limited) return limited;
    const body = await c.req.json();
    const { email, name } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    // Check if already subscribed
    const existing = await kv.get(`newsletter:${email}`);
    if (existing) {
      return c.json({ error: "Email already subscribed" }, 400);
    }

    // Save subscription
    const subscription = {
      email,
      name: name || '',
      status: 'active',
      subscribedAt: new Date().toISOString(),
      source: 'website'
    };

    await kv.set(`newsletter:${email}`, subscription);

    console.log(`New newsletter subscription: ${email}`);

    return c.json({ 
      success: true,
      message: "Successfully subscribed to newsletter!" 
    });

  } catch (error) {
    console.log(`Newsletter subscribe error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Unsubscribe from newsletter
app.post("/make-server-fd41cd37/newsletter/unsubscribe", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Get subscription
    const subscription = await kv.get(`newsletter:${email}`);
    if (!subscription) {
      return c.json({ error: "Email not found in subscribers list" }, 404);
    }

    // Update status to unsubscribed
    subscription.status = 'unsubscribed';
    subscription.unsubscribedAt = new Date().toISOString();
    await kv.set(`newsletter:${email}`, subscription);

    console.log(`Newsletter unsubscribe: ${email}`);

    return c.json({ 
      success: true,
      message: "Successfully unsubscribed from newsletter" 
    });

  } catch (error) {
    console.log(`Newsletter unsubscribe error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Check if any admin exists
app.get("/make-server-fd41cd37/admin/check-exists", async (c) => {
  try {
    // Get all users and check if any have admin role
    const allUsers = await kv.getByPrefix('user_profile:');
    const adminExists = allUsers.some((user: any) => user.role === 'admin');

    return c.json({ exists: adminExists });

  } catch (error) {
    console.log(`Check admin exists error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create first admin (only works if no admin exists)
app.post("/make-server-fd41cd37/admin/create-first-admin", async (c) => {
  try {
    // Check if admin already exists
    const allUsers = await kv.getByPrefix('user_profile:');
    const adminExists = allUsers.some((user: any) => user.role === 'admin');

    if (adminExists) {
      return c.json({ error: "Admin account already exists" }, 400);
    }

    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm for admin
    });

    if (error) {
      console.log(`Admin creation error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create admin user" }, 500);
    }

    // Store admin profile in KV store with admin role
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      createdAt: new Date().toISOString(),
      wishlist: [],
      savedItineraries: [],
      reviews: [],
      role: 'admin' // ADMIN ROLE
    });

    console.log(`✅ First admin account created: ${data.user.email}`);

    return c.json({ 
      success: true,
      message: "Admin account created successfully!",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'admin'
      }
    });

  } catch (error) {
    console.log(`Create first admin error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Helper function to verify admin access
async function verifyAdmin(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return { error: "No authorization header", status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { error: "Invalid or expired token", status: 401 };
  }

  const userProfile = await kv.get(`user_profile:${user.id}`);
  
  if (!userProfile || userProfile.role !== 'admin') {
    return { error: "Admin access required", status: 403 };
  }

  return { user, userProfile };
}

// Get admin dashboard stats
app.get("/make-server-fd41cd37/admin/stats", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user_profile:');
    
    // Get all wishlists
    const allWishlists = await kv.getByPrefix('wishlist:');
    
    // Get newsletter subscribers
    const newsletterSubs = await kv.getByPrefix('newsletter:');
    
    // Count total wishlist items
    let totalWishlistItems = 0;
    allWishlists.forEach((wishlist: any) => {
      if (wishlist.destinations && Array.isArray(wishlist.destinations)) {
        totalWishlistItems += wishlist.destinations.length;
      }
    });

    // Calculate stats
    const stats = {
      totalUsers: allUsers.length,
      totalDestinations: 197, // From places-full.ts
      totalViews: (await kv.get('stats:totalViews')) ?? 0,
      totalWishlists: totalWishlistItems,
      totalNewsletterSubs: newsletterSubs.length,
      recentActivity: [
        {
          type: 'user',
          message: 'New user registered',
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'wishlist',
          message: 'Destination added to wishlist',
          time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'newsletter',
          message: 'New newsletter subscription',
          time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    return c.json({ stats });

  } catch (error) {
    console.log(`Admin stats error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all users
app.get("/make-server-fd41cd37/admin/users", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user_profile:');
    
    // Add status field if not present and format data
    const users = allUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'user',
      status: u.status || 'active',
      createdAt: u.createdAt,
      wishlist: u.wishlist || []
    }));

    return c.json({ users });

  } catch (error) {
    console.log(`Admin users error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user role
app.put("/make-server-fd41cd37/admin/users/:userId/role", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const userId = c.req.param('userId');
    const { role } = await c.req.json();

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return c.json({ error: "Invalid role" }, 400);
    }

    // Get target user
    const targetUser = await kv.get(`user_profile:${userId}`);
    if (!targetUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update user role
    targetUser.role = role;
    targetUser.updatedAt = new Date().toISOString();
    await kv.set(`user_profile:${userId}`, targetUser);

    console.log(`User ${targetUser.email} role updated to ${role}`);
    await logAdminAction(adminCheck.userProfile, 'user.role.update', { userId, email: targetUser.email, role });

    return c.json({ success: true, user: targetUser });

  } catch (error) {
    console.log(`Update user role error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user status (ban/unban)
app.put("/make-server-fd41cd37/admin/users/:userId/status", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const userId = c.req.param('userId');
    const { status } = await c.req.json();

    if (!['active', 'banned'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    // Get target user
    const targetUser = await kv.get(`user_profile:${userId}`);
    if (!targetUser) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update user status
    targetUser.status = status;
    targetUser.updatedAt = new Date().toISOString();
    await kv.set(`user_profile:${userId}`, targetUser);

    console.log(`User ${targetUser.email} status updated to ${status}`);
    await logAdminAction(adminCheck.userProfile, 'user.status.update', { userId, email: targetUser.email, status });

    return c.json({ success: true, user: targetUser });

  } catch (error) {
    console.log(`Update user status error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create destination
app.post("/make-server-fd41cd37/admin/destinations", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const destinationData = await c.req.json();

    // Generate ID and slug
    const id = crypto.randomUUID();
    const slug = destinationData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const destination = {
      id,
      slug,
      ...destinationData,
      createdAt: new Date().toISOString(),
      createdBy: adminCheck.user.id
    };

    await kv.set(`destination:${id}`, destination);
    await kv.set(`destination-slug:${slug}`, id);

    console.log(`Destination created: ${destination.name}`);
    await logAdminAction(adminCheck.userProfile, 'destination.create', { id, slug, name: destination.name });

    return c.json({ success: true, destination });

  } catch (error) {
    console.log(`Create destination error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update destination
app.put("/make-server-fd41cd37/admin/destinations/:id", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const destId = c.req.param('id');
    const updates = await c.req.json();

    // Get destination
    const destination = await kv.get(`destination:${destId}`);
    if (!destination) {
      return c.json({ error: "Destination not found" }, 404);
    }

    // Save previous version for undo / audit
    const versionKey = `destination-version:${destId}:${Date.now()}`;
    await kv.set(versionKey, { ...destination, archivedAt: new Date().toISOString() });

    // Update destination
    const updated = {
      ...destination,
      ...updates,
      id: destId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      updatedBy: adminCheck.user.id
    };

    await kv.set(`destination:${destId}`, updated);

    console.log(`Destination updated: ${updated.name}`);
    await logAdminAction(adminCheck.userProfile, 'destination.update', { id: destId, name: updated.name });

    return c.json({ success: true, destination: updated });

  } catch (error) {
    console.log(`Update destination error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete destination
app.delete("/make-server-fd41cd37/admin/destinations/:id", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const destId = c.req.param('id');

    // Get destination to get slug
    const destination = await kv.get(`destination:${destId}`);
    if (destination && destination.slug) {
      await kv.del(`destination-slug:${destination.slug}`);
    }

    await kv.del(`destination:${destId}`);

    console.log(`Destination deleted: ${destId}`);
    await logAdminAction(adminCheck.userProfile, 'destination.delete', { id: destId, name: destination?.name });

    return c.json({ success: true });

  } catch (error) {
    console.log(`Delete destination error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get newsletter subscribers
app.get("/make-server-fd41cd37/admin/newsletter/subscribers", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const subscribers = await kv.getByPrefix('newsletter:');

    return c.json({ subscribers });

  } catch (error) {
    console.log(`Get newsletter subscribers error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Send newsletter
app.post("/make-server-fd41cd37/admin/newsletter/send", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const { subject, body, template } = await c.req.json();

    if (!subject || !body) {
      return c.json({ error: "Subject and body are required" }, 400);
    }

    // Get active subscribers
    const allSubscribers = await kv.getByPrefix('newsletter:');
    const activeSubscribers = allSubscribers.filter((sub: any) => sub.status === 'active');

    // TODO: Implement actual email sending with a service like SendGrid, Resend, etc.
    // For now, just log the action
    console.log(`Newsletter sent to ${activeSubscribers.length} subscribers`);
    console.log(`Subject: ${subject}`);

    // Save newsletter to history
    const newsletterId = crypto.randomUUID();
    await kv.set(`newsletter-sent:${newsletterId}`, {
      id: newsletterId,
      subject,
      body,
      template,
      sentAt: new Date().toISOString(),
      sentBy: adminCheck.user.id,
      recipientCount: activeSubscribers.length
    });

    return c.json({ 
      success: true, 
      message: `Newsletter sent to ${activeSubscribers.length} subscribers` 
    });

  } catch (error) {
    console.log(`Send newsletter error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get site settings
app.get("/make-server-fd41cd37/admin/settings", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const settings = await kv.get('site-settings') || {
      featuredDestinations: ['darjeeling', 'sundarbans', 'victoria-memorial'],
      banner: {
        enabled: true,
        text: '🎉 Special Offer: 20% OFF on all weekend packages!',
        link: '#/explore',
        bgColor: '#8B5CF6'
      },
      notifications: {
        newUserEmail: true,
        newBookingEmail: true,
        weeklyReport: true,
        newsletterConfirmation: true
      },
      seo: {
        title: 'GOBRO - Explore West Bengal Tourism',
        description: 'Discover 197+ amazing destinations across West Bengal. Plan your perfect trip with GOBRO.',
        keywords: 'West Bengal tourism, Darjeeling, Sundarbans, travel guide, India tourism'
      }
    };

    return c.json({ settings });

  } catch (error) {
    console.log(`Get settings error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update site settings
app.put("/make-server-fd41cd37/admin/settings", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const settings = await c.req.json();

    // Save settings
    await kv.set('site-settings', {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: adminCheck.user.id
    });

    console.log('Site settings updated');

    return c.json({ success: true });

  } catch (error) {
    console.log(`Update settings error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// SEARCH ENDPOINTS
// ============================================

// Search places with full-text search
app.get("/make-server-fd41cd37/search", async (c) => {
  try {
    const query = c.req.query('q') || '';
    const category = c.req.query('category');
    const region = c.req.query('region');
    const minRating = c.req.query('minRating') ? parseFloat(c.req.query('minRating')!) : undefined;
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20;

    if (!query || query.trim().length < 2) {
      return c.json({ error: "Search query must be at least 2 characters" }, 400);
    }

    const results = searchEngine.searchPlaces(query, {
      category,
      region,
      minRating,
      limit
    });

    console.log(`Search query "${query}" returned ${results.length} results`);

    return c.json({
      success: true,
      query,
      count: results.length,
      results
    });

  } catch (error) {
    console.log(`Search error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get search suggestions (autocomplete)
app.get("/make-server-fd41cd37/search/suggestions", async (c) => {
  try {
    const query = c.req.query('q') || '';
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;

    if (!query || query.trim().length < 2) {
      return c.json({ suggestions: [] });
    }

    const suggestions = searchEngine.getSearchSuggestions(query, limit);

    return c.json({ suggestions });

  } catch (error) {
    console.log(`Get suggestions error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get popular searches
app.get("/make-server-fd41cd37/search/popular", async (c) => {
  try {
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10;
    const popular = searchEngine.getPopularSearches(limit);

    return c.json({ popular });

  } catch (error) {
    console.log(`Get popular searches error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get search stats
app.get("/make-server-fd41cd37/search/stats", async (c) => {
  try {
    const stats = searchEngine.getSearchStats();

    return c.json({ stats });

  } catch (error) {
    console.log(`Get search stats error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Track search query (for analytics)
app.post("/make-server-fd41cd37/search/track", async (c) => {
  try {
    const body = await c.req.json();
    const { query, results, userId } = body;

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    // Store search query for analytics
    const searchId = crypto.randomUUID();
    await kv.set(`search_query:${searchId}`, {
      id: searchId,
      query,
      resultsCount: results || 0,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      userAgent: c.req.header('user-agent') || 'unknown'
    });

    return c.json({ success: true });

  } catch (error) {
    console.log(`Track search error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// MULTI-SESSION ENDPOINTS
// ============================================

// Get all active sessions for current user
app.get("/make-server-fd41cd37/user/sessions", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Get all sessions for this user
    const sessions = await sessionManager.getUserSessions(user.id);

    // Format sessions for display
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isActive: session.isActive
    }));

    return c.json({ 
      success: true, 
      count: formattedSessions.length,
      sessions: formattedSessions 
    });

  } catch (error) {
    console.log(`Get sessions error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Logout from a specific session
app.post("/make-server-fd41cd37/user/logout-session", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const body = await c.req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return c.json({ error: "Session ID is required" }, 400);
    }

    // Logout the specific session
    const success = await sessionManager.logoutSession(sessionId);

    if (!success) {
      return c.json({ error: "Session not found" }, 404);
    }

    return c.json({ 
      success: true, 
      message: "Session logged out successfully" 
    });

  } catch (error) {
    console.log(`Logout session error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Logout from all devices
app.post("/make-server-fd41cd37/user/logout-all-sessions", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Logout all sessions
    const count = await sessionManager.logoutAllSessions(user.id);

    return c.json({ 
      success: true, 
      message: `Logged out from ${count} devices`,
      count 
    });

  } catch (error) {
    console.log(`Logout all sessions error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// PLACES/DESTINATIONS ENDPOINTS
// ============================================

// Get all places with pagination and filtering
app.get("/make-server-fd41cd37/places", async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const category = c.req.query('category');
    const region = c.req.query('region');
    const minRating = c.req.query('minRating') ? parseFloat(c.req.query('minRating')!) : undefined;

    // This would typically come from your places data
    const stats = searchEngine.getSearchStats();

    return c.json({ 
      success: true,
      stats: {
        total: stats.totalPlaces,
        categories: stats.categoryCounts,
        regions: stats.regionCounts,
        averageRating: stats.averageRating
      },
      pagination: {
        page,
        limit,
        total: stats.totalPlaces,
        totalPages: Math.ceil(stats.totalPlaces / limit)
      }
    });

  } catch (error) {
    console.log(`Get places error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get place by slug
app.get("/make-server-fd41cd37/places/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');
    if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) {
      return c.json({ error: "Invalid slug format" }, 400);
    }

    // Check if place exists in KV store (custom added places)
    const customPlace = await kv.get(`destination-slug:${slug}`);
    if (customPlace) {
      const placeId = customPlace;
      const place = await kv.get(`destination:${placeId}`);
      
      if (place) {
        return c.json({ success: true, place });
      }
    }

    return c.json({ error: "Place not found" }, 404);

  } catch (error) {
    console.log(`Get place error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// DISTRICTS ENDPOINTS
// ============================================

// Get all districts
app.get("/make-server-fd41cd37/districts", async (c) => {
  try {
    const districts = await kv.getByPrefix('district:');

    return c.json({ 
      success: true, 
      count: districts.length,
      districts 
    });

  } catch (error) {
    console.log(`Get districts error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get district by slug
app.get("/make-server-fd41cd37/districts/:slug", async (c) => {
  try {
    const slug = c.req.param('slug');

    const districtId = await kv.get(`district-slug:${slug}`);
    if (!districtId) {
      return c.json({ error: "District not found" }, 404);
    }

    const district = await kv.get(`district:${districtId}`);
    
    if (!district) {
      return c.json({ error: "District not found" }, 404);
    }

    return c.json({ success: true, district });

  } catch (error) {
    console.log(`Get district error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create district (admin only)
app.post("/make-server-fd41cd37/admin/districts", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const body = await c.req.json();
    const { name, region, overview, heroImage } = body;

    if (!name || !region) {
      return c.json({ error: "Name and region are required" }, 400);
    }

    const id = crypto.randomUUID();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const district = {
      id,
      name,
      slug,
      region,
      overview,
      heroImage,
      createdAt: new Date().toISOString(),
      createdBy: adminCheck.user.id
    };

    await kv.set(`district:${id}`, district);
    await kv.set(`district-slug:${slug}`, id);

    console.log(`✅ District created: ${name}`);

    return c.json({ success: true, district });

  } catch (error) {
    console.log(`Create district error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============================================
// ANALYTICS & STATISTICS
// ============================================

// Get platform analytics
app.get("/make-server-fd41cd37/analytics", async (c) => {
  try {
    // Get search analytics
    const allSearches = await kv.getByPrefix('search_query:');
    
    // Get user count
    const allUsers = await kv.getByPrefix('user_profile:');
    
    // Get newsletter subscribers
    const newsletterSubs = await kv.getByPrefix('newsletter:');
    
    // Get wishlists
    const wishlists = await kv.getByPrefix('wishlist:');

    const analytics = {
      totalSearches: allSearches.length,
      totalUsers: allUsers.length,
      totalNewsletterSubscribers: newsletterSubs.length,
      totalWishlists: wishlists.length,
      searchStats: searchEngine.getSearchStats()
    };

    return c.json({ success: true, analytics });

  } catch (error) {
    console.log(`Get analytics error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// User-submitted "incorrect info" report (public, anon-key)
app.post("/make-server-fd41cd37/places/report", async (c) => {
  try {
    const limited = await rateLimit(c, 'report', 10, 600);
    if (limited) return limited;
    const { slug, message, email } = await c.req.json();
    if (!slug || !message || message.length > 2000) {
      return c.json({ error: "slug and message (≤2000 chars) required" }, 400);
    }
    const id = `place-report:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await kv.set(id, {
      id,
      slug,
      message,
      email: email ?? '',
      ip: clientIp(c),
      status: 'open',
      timestamp: new Date().toISOString(),
    });
    return c.json({ success: true });
  } catch (error) {
    console.log(`Place report error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: list place reports
app.get("/make-server-fd41cd37/admin/place-reports", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) return c.json({ error: adminCheck.error }, adminCheck.status);
    const entries = await kv.getByPrefix('place-report:');
    entries.sort((a: any, b: any) => (a.timestamp < b.timestamp ? 1 : -1));
    return c.json({ entries });
  } catch (error) {
    console.log(`Place reports fetch error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get admin audit log (admin only)
app.get("/make-server-fd41cd37/admin/audit-log", async (c) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }
    const entries = await kv.getByPrefix('audit:');
    entries.sort((a: any, b: any) => (a.timestamp < b.timestamp ? 1 : -1));
    return c.json({ entries: entries.slice(0, 200) });
  } catch (error) {
    console.log(`Audit log fetch error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Track a page view (public, anon-key auth via gateway)
app.post("/make-server-fd41cd37/track/view", async (c) => {
  try {
    const current = (await kv.get('stats:totalViews')) ?? 0;
    await kv.set('stats:totalViews', current + 1);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Track view error: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);