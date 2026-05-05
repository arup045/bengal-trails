import * as kv from './kv_store.tsx';

// Database utility functions using KV store
// User data is stored with keys like: user:{userId} and user:email:{email}

/**
 * Get user from KV store by ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      console.error('Error fetching user by id: User not found');
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('Error in getUserById:', err);
    return null;
  }
}

/**
 * Get user from KV store by email
 */
export async function getUserByEmail(email: string) {
  try {
    const userId = await kv.get(`user:email:${email}`);
    
    if (!userId) {
      return null;
    }
    
    return getUserById(userId);
  } catch (err) {
    console.error('Error in getUserByEmail:', err);
    return null;
  }
}

/**
 * Create user in KV store
 */
export async function createUser(userId: string, email: string, name: string, role: string = 'user') {
  try {
    const userData = {
      id: userId,
      email,
      name,
      role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    
    // Store user data with user:id key
    await kv.set(`user:${userId}`, userData);
    
    // Store email->userId mapping for lookups
    await kv.set(`user:email:${email}`, userId);
    
    // Add to users list
    const allUserIds = await kv.get('users:all') || [];
    if (!allUserIds.includes(userId)) {
      allUserIds.push(userId);
      await kv.set('users:all', allUserIds);
    }
    
    return userData;
  } catch (err) {
    console.error('Error in createUser:', err);
    return null;
  }
}

/**
 * Update user in KV store
 */
export async function updateUser(userId: string, updates: any) {
  try {
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      console.error('Error updating user: User not found');
      return null;
    }
    
    const updatedUser = {
      ...existingUser,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`user:${userId}`, updatedUser);
    
    // If email changed, update email mapping
    if (updates.email && updates.email !== existingUser.email) {
      await kv.del(`user:email:${existingUser.email}`);
      await kv.set(`user:email:${updates.email}`, userId);
    }
    
    return updatedUser;
  } catch (err) {
    console.error('Error in updateUser:', err);
    return null;
  }
}

/**
 * Update user last login timestamp
 */
export async function updateLastLogin(userId: string) {
  try {
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return;
    }
    
    await kv.set(`user:${userId}`, {
      ...existingUser,
      last_login: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating last login:', err);
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const allUserIds = await kv.get('users:all') || [];
    
    if (allUserIds.length === 0) {
      return [];
    }
    
    // Fetch all user data
    const users = [];
    for (const userId of allUserIds) {
      const user = await getUserById(userId);
      if (user) {
        users.push(user);
      }
    }
    
    // Sort by created_at descending
    users.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return users;
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    return [];
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator') {
  return updateUser(userId, { role });
}

/**
 * Update user status (admin only)
 */
export async function updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended') {
  return updateUser(userId, { status });
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      return false;
    }
    
    // Remove from email mapping
    await kv.del(`user:email:${user.email}`);
    
    // Remove from all users list
    const allUserIds = await kv.get('users:all') || [];
    const updatedUserIds = allUserIds.filter((id: string) => id !== userId);
    await kv.set('users:all', updatedUserIds);
    
    // Remove user data
    await kv.del(`user:${userId}`);
    
    return true;
  } catch (err) {
    console.error('Error in deleteUser:', err);
    return false;
  }
}
