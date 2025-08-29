// Email validation function
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Format date and time
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Capitalize first letter
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
export function truncate(text, length = 50) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Format phone number
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
}

// Validate phone number
export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Sleep function for async operations
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Deep clone object
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// Class name utility function for conditional classes
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Get role display name
export function getRoleDisplayName(role) {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    accountant: 'Accountant',
    agent: 'Agent',
  };
  return roleNames[role] || role;
}

// Get role color for UI
export function getRoleColor(role) {
  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    accountant: 'bg-green-100 text-green-800',
    agent: 'bg-gray-100 text-gray-800',
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}
