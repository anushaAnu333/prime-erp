import { API_ENDPOINTS } from "./config";

// Cache duration for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API client with caching and optimization
class ApiClient {
  constructor() {
    this.cache = new Map();
  }

  // Get cached data if available and not expired
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Set cache data
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Clear cache for specific key or all
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Make API request with error handling and retry logic
  async request(url, options = {}) {
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // GET request with caching
  async get(url, useCache = true) {
    if (useCache) {
      const cached = this.getCachedData(url);
      if (cached) {
        return cached;
      }
    }

    const data = await this.request(url);

    if (useCache) {
      this.setCachedData(url, data);
    }

    return data;
  }

  // POST request
  async post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(url, data) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(url) {
    return this.request(url, {
      method: "DELETE",
    });
  }

  // Auth methods
  async login(credentials) {
    const response = await this.post(API_ENDPOINTS.LOGIN, credentials);
    this.clearCache(); // Clear cache on login
    return response;
  }

  async logout() {
    const response = await this.post(API_ENDPOINTS.LOGOUT);
    this.clearCache(); // Clear cache on logout
    return response;
  }

  async getCurrentUser() {
    return this.get(API_ENDPOINTS.ME, false); // Don't cache user data
  }

  // Sales methods
  async getSales() {
    return this.get(API_ENDPOINTS.SALES);
  }

  async getSale(id) {
    return this.get(API_ENDPOINTS.SALE_BY_ID(id));
  }

  async createSale(data) {
    const response = await this.post(API_ENDPOINTS.SALES, data);
    this.clearCache(API_ENDPOINTS.SALES); // Clear sales cache
    return response;
  }

  async updateSale(id, data) {
    const response = await this.put(API_ENDPOINTS.SALE_BY_ID(id), data);
    this.clearCache(API_ENDPOINTS.SALES); // Clear sales cache
    this.clearCache(API_ENDPOINTS.SALE_BY_ID(id)); // Clear specific sale cache
    return response;
  }

  async deleteSale(id) {
    const response = await this.delete(API_ENDPOINTS.SALE_BY_ID(id));
    this.clearCache(API_ENDPOINTS.SALES); // Clear sales cache
    this.clearCache(API_ENDPOINTS.SALE_BY_ID(id)); // Clear specific sale cache
    return response;
  }

  // Customers methods
  async getCustomers() {
    return this.get(API_ENDPOINTS.CUSTOMERS);
  }

  async getCustomer(id) {
    return this.get(API_ENDPOINTS.CUSTOMER_BY_ID(id));
  }

  async createCustomer(data) {
    const response = await this.post(API_ENDPOINTS.CUSTOMERS, data);
    this.clearCache(API_ENDPOINTS.CUSTOMERS);
    return response;
  }

  async updateCustomer(id, data) {
    const response = await this.put(API_ENDPOINTS.CUSTOMER_BY_ID(id), data);
    this.clearCache(API_ENDPOINTS.CUSTOMERS);
    this.clearCache(API_ENDPOINTS.CUSTOMER_BY_ID(id));
    return response;
  }

  async deleteCustomer(id) {
    const response = await this.delete(API_ENDPOINTS.CUSTOMER_BY_ID(id));
    this.clearCache(API_ENDPOINTS.CUSTOMERS);
    this.clearCache(API_ENDPOINTS.CUSTOMER_BY_ID(id));
    return response;
  }

  // Products methods
  async getProducts() {
    return this.get(API_ENDPOINTS.PRODUCTS);
  }

  async getProduct(id) {
    return this.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
  }

  async createProduct(data) {
    const response = await this.post(API_ENDPOINTS.PRODUCTS, data);
    this.clearCache(API_ENDPOINTS.PRODUCTS);
    return response;
  }

  async updateProduct(id, data) {
    const response = await this.put(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
    this.clearCache(API_ENDPOINTS.PRODUCTS);
    this.clearCache(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response;
  }

  async deleteProduct(id) {
    const response = await this.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    this.clearCache(API_ENDPOINTS.PRODUCTS);
    this.clearCache(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response;
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.get(API_ENDPOINTS.DASHBOARD_STATS);
  }

  async getDashboard() {
    return this.get(API_ENDPOINTS.DASHBOARD);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
