// Client-side authentication utilities
export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      throw new Error('Failed to get session');
    }
    const session = await response.json();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to sign out');
    }
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};








