import apiClient from './api';

// Get current user from the backend API
export async function getCurrentUser() {
  try {
    const response = await apiClient.getCurrentUser();
    return response.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}

// Login function
export async function login(credentials) {
  try {
    const response = await apiClient.login(credentials);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    const response = await apiClient.logout();
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Check user permissions
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check specific permissions based on role
  const rolePermissions = {
    manager: ['read', 'write', 'delete'],
    accountant: ['read', 'write'],
    agent: ['read']
  };
  
  return rolePermissions[user.role]?.includes(permission) || false;
}

// Get user role display name
export function getRoleDisplayName(role) {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    accountant: 'Accountant',
    agent: 'Delivery Agent'
  };
  
  return roleNames[role] || role;
}
