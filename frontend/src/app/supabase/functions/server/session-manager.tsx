/**
 * SESSION MANAGER FOR MULTI-DEVICE LOGIN SUPPORT
 * No JWT - Pure session-based authentication
 */

import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Session {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  lastActivity: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  loginProvider: 'local' | 'google' | 'facebook';
  createdAt: string;
  lastLogin: string;
}

// Session expiry: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return `session_${crypto.randomUUID()}_${Date.now()}`;
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  userAgent: string,
  ipAddress: string
): Promise<Session> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const session: Session = {
    id: sessionId,
    userId,
    userAgent,
    ipAddress,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    lastActivity: now.toISOString()
  };

  // Store session
  await kv.set(`session:${sessionId}`, session);
  
  // Also store in user's sessions list
  const userSessions = await kv.get(`user_sessions:${userId}`) || [];
  userSessions.push(sessionId);
  await kv.set(`user_sessions:${userId}`, userSessions);

  console.log(`✅ Session created for user ${userId}: ${sessionId}`);
  
  return session;
}

/**
 * Validate a session and return user if valid
 */
export async function validateSession(sessionId: string): Promise<{ user: User | null; session: Session | null }> {
  if (!sessionId) {
    return { user: null, session: null };
  }

  // Get session
  const session = await kv.get(`session:${sessionId}`) as Session | null;
  
  if (!session) {
    return { user: null, session: null };
  }

  // Check if session is active
  if (!session.isActive) {
    return { user: null, session: null };
  }

  // Check if session has expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt) {
    // Session expired - deactivate it
    session.isActive = false;
    await kv.set(`session:${sessionId}`, session);
    return { user: null, session: null };
  }

  // Update last activity (sliding expiration)
  session.lastActivity = now.toISOString();
  await kv.set(`session:${sessionId}`, session);

  // Get user profile
  const user = await kv.get(`user_profile:${session.userId}`) as User | null;
  
  if (!user) {
    return { user: null, session: null };
  }

  return { user, session };
}

/**
 * Logout from a specific session
 */
export async function logoutSession(sessionId: string): Promise<boolean> {
  const session = await kv.get(`session:${sessionId}`) as Session | null;
  
  if (!session) {
    return false;
  }

  // Deactivate session
  session.isActive = false;
  await kv.set(`session:${sessionId}`, session);

  console.log(`✅ Session logged out: ${sessionId}`);
  
  return true;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const sessionIds = await kv.get(`user_sessions:${userId}`) || [];
  const sessions: Session[] = [];

  for (const sessionId of sessionIds) {
    const session = await kv.get(`session:${sessionId}`) as Session | null;
    if (session && session.isActive) {
      // Check if not expired
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      if (now <= expiresAt) {
        sessions.push(session);
      }
    }
  }

  return sessions;
}

/**
 * Logout from all devices (deactivate all sessions)
 */
export async function logoutAllSessions(userId: string): Promise<number> {
  const sessionIds = await kv.get(`user_sessions:${userId}`) || [];
  let count = 0;

  for (const sessionId of sessionIds) {
    const success = await logoutSession(sessionId);
    if (success) count++;
  }

  console.log(`✅ Logged out from ${count} sessions for user ${userId}`);
  
  return count;
}

/**
 * Cleanup expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const allSessions = await kv.getByPrefix('session:');
  const now = new Date();
  let cleaned = 0;

  for (const session of allSessions) {
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt && session.isActive) {
      session.isActive = false;
      await kv.set(`session:${session.id}`, session);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
  }

  return cleaned;
}

/**
 * Update last login time for user
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const user = await kv.get(`user_profile:${userId}`);
  if (user) {
    user.lastLogin = new Date().toISOString();
    await kv.set(`user_profile:${userId}`, user);
  }
}
