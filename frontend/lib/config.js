// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API endpoints - Use relative URLs for Next.js API proxy
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `/api/auth/login`,
  LOGOUT: `/api/auth/logout`,
  ME: `/api/auth/me`,

  // Sales
  SALES: `/api/sales`,
  SALE_BY_ID: (id) => `/api/sales/${id}`,

  // Customers
  CUSTOMERS: `/api/customers`,
  CUSTOMER_BY_ID: (id) => `/api/customers/${id}`,

  // Products
  PRODUCTS: `/api/products`,
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,

  // Purchases
  PURCHASES: `/api/purchases`,
  PURCHASE_BY_ID: (id) => `/api/purchases/${id}`,

  // Vendors
  VENDORS: `/api/vendors`,
  VENDOR_BY_ID: (id) => `/api/vendors/${id}`,

  // Stock
  STOCK: `/api/stock`,
  STOCK_BY_ID: (id) => `/api/stock/${id}`,

  // Payments
  PAYMENTS: `/api/payments`,
  PAYMENT_BY_ID: (id) => `/api/payments/${id}`,

  // Dashboard
  DASHBOARD: `/api/dashboard`,
  DASHBOARD_STATS: `/api/dashboard/stats`,

  // Users
  USERS: `/api/users`,
  USER_BY_ID: (id) => `/api/users/${id}`,

  // Companies
  COMPANIES: `/api/companies`,
  COMPANY_BY_ID: (id) => `/api/companies/${id}`,
};

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  API_URL: API_BASE_URL,
};
