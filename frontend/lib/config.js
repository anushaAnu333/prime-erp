// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API endpoints - Use full URLs to backend server
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Sales
  SALES: `${API_BASE_URL}/api/sales`,
  SALE_BY_ID: (id) => `${API_BASE_URL}/api/sales/${id}`,

  // Customers
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  CUSTOMER_BY_ID: (id) => `${API_BASE_URL}/api/customers/${id}`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`,

  // Purchases
  PURCHASES: `${API_BASE_URL}/api/purchases`,
  PURCHASE_BY_ID: (id) => `${API_BASE_URL}/api/purchases/${id}`,

  // Vendors
  VENDORS: `${API_BASE_URL}/api/vendors`,
  VENDOR_BY_ID: (id) => `${API_BASE_URL}/api/vendors/${id}`,

  // Stock
  STOCK: `${API_BASE_URL}/api/stock`,
  STOCK_BY_ID: (id) => `${API_BASE_URL}/api/stock/${id}`,

  // Payments
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  PAYMENT_BY_ID: (id) => `${API_BASE_URL}/api/payments/${id}`,

  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,

  // Users
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,

  // Companies
  COMPANIES: `${API_BASE_URL}/api/companies`,
  COMPANY_BY_ID: (id) => `${API_BASE_URL}/api/companies/${id}`,
};

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  API_URL: API_BASE_URL,
};
