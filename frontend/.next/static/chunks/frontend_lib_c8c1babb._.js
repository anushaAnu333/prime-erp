(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/lib/config.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API Configuration
__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS,
    "ENV_CONFIG",
    ()=>ENV_CONFIG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:3001") || "http://localhost:3001";
const API_ENDPOINTS = {
    // Auth
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    // Sales
    SALES: "/api/sales",
    SALE_BY_ID: (id)=>"/api/sales/".concat(id),
    // Customers
    CUSTOMERS: "/api/customers",
    CUSTOMER_BY_ID: (id)=>"/api/customers/".concat(id),
    // Products
    PRODUCTS: "/api/products",
    PRODUCT_BY_ID: (id)=>"/api/products/".concat(id),
    // Purchases
    PURCHASES: "/api/purchases",
    PURCHASE_BY_ID: (id)=>"/api/purchases/".concat(id),
    // Vendors
    VENDORS: "/api/vendors",
    VENDOR_BY_ID: (id)=>"/api/vendors/".concat(id),
    // Stock
    STOCK: "/api/stock",
    STOCK_BY_ID: (id)=>"/api/stock/".concat(id),
    // Payments
    PAYMENTS: "/api/payments",
    PAYMENT_BY_ID: (id)=>"/api/payments/".concat(id),
    // Dashboard
    DASHBOARD: "/api/dashboard",
    DASHBOARD_STATS: "/api/dashboard/stats",
    // Users
    USERS: "/api/users",
    USER_BY_ID: (id)=>"/api/users/".concat(id),
    // Companies
    COMPANIES: "/api/companies",
    COMPANY_BY_ID: (id)=>"/api/companies/".concat(id)
};
const ENV_CONFIG = {
    IS_DEVELOPMENT: ("TURBOPACK compile-time value", "development") === "development",
    IS_PRODUCTION: ("TURBOPACK compile-time value", "development") === "production",
    API_URL: API_BASE_URL
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/api.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/config.js [app-client] (ecmascript)");
;
// Cache duration for API responses
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// API client with caching and optimization
class ApiClient {
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
            timestamp: Date.now()
        });
    }
    // Clear cache for specific key or all
    clearCache() {
        let key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
    // Make API request with error handling and retry logic
    async request(url) {
        let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        const defaultOptions = {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        };
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        try {
            const response = await fetch(url, finalOptions);
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({
                        message: "HTTP error! status: ".concat(response.status)
                    }));
                throw new Error(errorData.message || "HTTP error! status: ".concat(response.status));
            }
            return await response.json();
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }
    // GET request with caching
    async get(url) {
        let useCache = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
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
            body: JSON.stringify(data)
        });
    }
    // PUT request
    async put(url, data) {
        return this.request(url, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }
    // DELETE request
    async delete(url) {
        return this.request(url, {
            method: "DELETE"
        });
    }
    // Auth methods
    async login(credentials) {
        const response = await this.post(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].LOGIN, credentials);
        this.clearCache(); // Clear cache on login
        return response;
    }
    async logout() {
        const response = await this.post(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].LOGOUT);
        this.clearCache(); // Clear cache on logout
        return response;
    }
    async getCurrentUser() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].ME, false); // Don't cache user data
    }
    // Sales methods
    async getSales() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALES);
    }
    async getSale(id) {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALE_BY_ID(id));
    }
    async createSale(data) {
        const response = await this.post(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALES, data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALES); // Clear sales cache
        return response;
    }
    async updateSale(id, data) {
        const response = await this.put(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALE_BY_ID(id), data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALES); // Clear sales cache
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALE_BY_ID(id)); // Clear specific sale cache
        return response;
    }
    async deleteSale(id) {
        const response = await this.delete(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALE_BY_ID(id));
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALES); // Clear sales cache
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].SALE_BY_ID(id)); // Clear specific sale cache
        return response;
    }
    // Customers methods
    async getCustomers() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMERS);
    }
    async getCustomer(id) {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMER_BY_ID(id));
    }
    async createCustomer(data) {
        const response = await this.post(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMERS, data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMERS);
        return response;
    }
    async updateCustomer(id, data) {
        const response = await this.put(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMER_BY_ID(id), data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMERS);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMER_BY_ID(id));
        return response;
    }
    async deleteCustomer(id) {
        const response = await this.delete(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMER_BY_ID(id));
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMERS);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CUSTOMER_BY_ID(id));
        return response;
    }
    // Products methods
    async getProducts() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCTS);
    }
    async getProduct(id) {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCT_BY_ID(id));
    }
    async createProduct(data) {
        const response = await this.post(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCTS, data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCTS);
        return response;
    }
    async updateProduct(id, data) {
        const response = await this.put(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCT_BY_ID(id), data);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCTS);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCT_BY_ID(id));
        return response;
    }
    async deleteProduct(id) {
        const response = await this.delete(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCT_BY_ID(id));
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCTS);
        this.clearCache(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].PRODUCT_BY_ID(id));
        return response;
    }
    // Dashboard methods
    async getDashboardStats() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].DASHBOARD_STATS);
    }
    async getDashboard() {
        return this.get(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$config$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].DASHBOARD);
    }
    constructor(){
        this.cache = new Map();
    }
}
// Create singleton instance
const apiClient = new ApiClient();
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/authSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearError",
    ()=>clearError,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getCurrentUser",
    ()=>getCurrentUser,
    "loginUser",
    ()=>loginUser,
    "logoutUser",
    ()=>logoutUser,
    "setUser",
    ()=>setUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const loginUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("auth/login", async (credentials, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].login(credentials);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const logoutUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("auth/logout", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].logout();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const getCurrentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("auth/getCurrentUser", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
};
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        setUser: (state, action)=>{
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Login
        .addCase(loginUser.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(loginUser.fulfilled, (state, action)=>{
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        }).addCase(loginUser.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
            state.user = null;
            state.isAuthenticated = false;
        })// Logout
        .addCase(logoutUser.pending, (state)=>{
            state.loading = true;
        }).addCase(logoutUser.fulfilled, (state)=>{
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        }).addCase(logoutUser.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Get Current User
        .addCase(getCurrentUser.pending, (state)=>{
            state.loading = true;
        }).addCase(getCurrentUser.fulfilled, (state, action)=>{
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        }).addCase(getCurrentUser.rejected, (state, action)=>{
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        });
    }
});
const { clearError, setUser } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/dashboardSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearDashboardData",
    ()=>clearDashboardData,
    "clearError",
    ()=>clearError,
    "default",
    ()=>__TURBOPACK__default__export__,
    "fetchDashboardData",
    ()=>fetchDashboardData,
    "fetchDashboardStats",
    ()=>fetchDashboardStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchDashboardData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("dashboard/fetchData", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getDashboard();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchDashboardStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("dashboard/fetchStats", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getDashboardStats();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    overview: {
        totalSales: 0,
        totalPurchases: 0,
        totalCustomers: 0,
        totalVendors: 0,
        totalProducts: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0
    },
    recentActivity: {
        sales: [],
        purchases: []
    },
    monthlyStats: {
        sales: []
    },
    salesTrend: [],
    purchasesTrend: [],
    topProducts: [],
    topCustomers: [],
    loading: false,
    error: null,
    lastFetched: null
};
const dashboardSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "dashboard",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearDashboardData: (state)=>{
            return {
                ...initialState
            };
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch Dashboard Data
        .addCase(fetchDashboardData.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchDashboardData.fulfilled, (state, action)=>{
            state.loading = false;
            // Direct assignment of response data to state
            state.overview = action.payload.overview || state.overview;
            state.recentActivity = action.payload.recentActivity || state.recentActivity;
            state.monthlyStats = action.payload.monthlyStats || state.monthlyStats;
            state.salesTrend = action.payload.salesTrend || state.salesTrend;
            state.purchasesTrend = action.payload.purchasesTrend || state.purchasesTrend;
            state.topProducts = action.payload.topProducts || state.topProducts;
            state.topCustomers = action.payload.topCustomers || state.topCustomers;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchDashboardData.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Dashboard Stats
        .addCase(fetchDashboardStats.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchDashboardStats.fulfilled, (state, action)=>{
            state.loading = false;
            // Handle stats response
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchDashboardStats.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearDashboardData } = dashboardSlice.actions;
const __TURBOPACK__default__export__ = dashboardSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/salesSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentSale",
    ()=>clearCurrentSale,
    "clearError",
    ()=>clearError,
    "createSale",
    ()=>createSale,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteSale",
    ()=>deleteSale,
    "fetchSaleById",
    ()=>fetchSaleById,
    "fetchSales",
    ()=>fetchSales,
    "setCurrentPage",
    ()=>setCurrentPage,
    "updateSale",
    ()=>updateSale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchSales = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("sales/fetchAll", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getSales();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchSaleById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("sales/fetchById", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getSale(id);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const createSale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("sales/create", async (saleData, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createSale(saleData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const updateSale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("sales/update", async (param, param1)=>{
    let { id, data } = param, { rejectWithValue } = param1;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].updateSale(id, data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const deleteSale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("sales/delete", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].deleteSale(id);
        return {
            id,
            response
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    sales: [],
    currentSale: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    lastFetched: null
};
const salesSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "sales",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentSale: (state)=>{
            state.currentSale = null;
        },
        setCurrentPage: (state, action)=>{
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch All Sales
        .addCase(fetchSales.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchSales.fulfilled, (state, action)=>{
            state.loading = false;
            state.sales = action.payload.sales || action.payload;
            state.total = action.payload.total || action.payload.length;
            state.totalPages = action.payload.totalPages || 1;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchSales.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Sale by ID
        .addCase(fetchSaleById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchSaleById.fulfilled, (state, action)=>{
            state.loading = false;
            state.currentSale = action.payload;
            state.error = null;
        }).addCase(fetchSaleById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Create Sale
        .addCase(createSale.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(createSale.fulfilled, (state, action)=>{
            state.loading = false;
            state.sales.unshift(action.payload.sale);
            state.total += 1;
            state.error = null;
        }).addCase(createSale.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Update Sale
        .addCase(updateSale.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(updateSale.fulfilled, (state, action)=>{
            state.loading = false;
            const index = state.sales.findIndex((sale)=>sale._id === action.payload.sale._id);
            if (index !== -1) {
                state.sales[index] = action.payload.sale;
            }
            if (state.currentSale && state.currentSale._id === action.payload.sale._id) {
                state.currentSale = action.payload.sale;
            }
            state.error = null;
        }).addCase(updateSale.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Delete Sale
        .addCase(deleteSale.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(deleteSale.fulfilled, (state, action)=>{
            state.loading = false;
            state.sales = state.sales.filter((sale)=>sale._id !== action.payload.id);
            state.total -= 1;
            if (state.currentSale && state.currentSale._id === action.payload.id) {
                state.currentSale = null;
            }
            state.error = null;
        }).addCase(deleteSale.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentSale, setCurrentPage } = salesSlice.actions;
const __TURBOPACK__default__export__ = salesSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/customersSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentCustomer",
    ()=>clearCurrentCustomer,
    "clearError",
    ()=>clearError,
    "createCustomer",
    ()=>createCustomer,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteCustomer",
    ()=>deleteCustomer,
    "fetchCustomerById",
    ()=>fetchCustomerById,
    "fetchCustomers",
    ()=>fetchCustomers,
    "setCurrentPage",
    ()=>setCurrentPage,
    "updateCustomer",
    ()=>updateCustomer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchCustomers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("customers/fetchAll", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCustomers();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchCustomerById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("customers/fetchById", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCustomer(id);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const createCustomer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("customers/create", async (customerData, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createCustomer(customerData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const updateCustomer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("customers/update", async (param, param1)=>{
    let { id, data } = param, { rejectWithValue } = param1;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].updateCustomer(id, data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const deleteCustomer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("customers/delete", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].deleteCustomer(id);
        return {
            id,
            response
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    customers: [],
    currentCustomer: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    lastFetched: null
};
const customersSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "customers",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentCustomer: (state)=>{
            state.currentCustomer = null;
        },
        setCurrentPage: (state, action)=>{
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch All Customers
        .addCase(fetchCustomers.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchCustomers.fulfilled, (state, action)=>{
            state.loading = false;
            state.customers = action.payload.customers || action.payload;
            state.total = action.payload.total || action.payload.length;
            state.totalPages = action.payload.totalPages || 1;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchCustomers.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Customer by ID
        .addCase(fetchCustomerById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchCustomerById.fulfilled, (state, action)=>{
            state.loading = false;
            state.currentCustomer = action.payload;
            state.error = null;
        }).addCase(fetchCustomerById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Create Customer
        .addCase(createCustomer.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(createCustomer.fulfilled, (state, action)=>{
            state.loading = false;
            state.customers.unshift(action.payload.customer);
            state.total += 1;
            state.error = null;
        }).addCase(createCustomer.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Update Customer
        .addCase(updateCustomer.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(updateCustomer.fulfilled, (state, action)=>{
            state.loading = false;
            const index = state.customers.findIndex((customer)=>customer._id === action.payload.customer._id);
            if (index !== -1) {
                state.customers[index] = action.payload.customer;
            }
            if (state.currentCustomer && state.currentCustomer._id === action.payload.customer._id) {
                state.currentCustomer = action.payload.customer;
            }
            state.error = null;
        }).addCase(updateCustomer.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Delete Customer
        .addCase(deleteCustomer.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(deleteCustomer.fulfilled, (state, action)=>{
            state.loading = false;
            state.customers = state.customers.filter((customer)=>customer._id !== action.payload.id);
            state.total -= 1;
            if (state.currentCustomer && state.currentCustomer._id === action.payload.id) {
                state.currentCustomer = null;
            }
            state.error = null;
        }).addCase(deleteCustomer.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentCustomer, setCurrentPage } = customersSlice.actions;
const __TURBOPACK__default__export__ = customersSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/productsSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentProduct",
    ()=>clearCurrentProduct,
    "clearError",
    ()=>clearError,
    "createProduct",
    ()=>createProduct,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteProduct",
    ()=>deleteProduct,
    "fetchProductById",
    ()=>fetchProductById,
    "fetchProducts",
    ()=>fetchProducts,
    "setCurrentPage",
    ()=>setCurrentPage,
    "updateProduct",
    ()=>updateProduct
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("products/fetchAll", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getProducts();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchProductById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("products/fetchById", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getProduct(id);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const createProduct = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("products/create", async (productData, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createProduct(productData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const updateProduct = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("products/update", async (param, param1)=>{
    let { id, data } = param, { rejectWithValue } = param1;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].updateProduct(id, data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const deleteProduct = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("products/delete", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].deleteProduct(id);
        return {
            id,
            response
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    lastFetched: null
};
const productsSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "products",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentProduct: (state)=>{
            state.currentProduct = null;
        },
        setCurrentPage: (state, action)=>{
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch All Products
        .addCase(fetchProducts.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchProducts.fulfilled, (state, action)=>{
            state.loading = false;
            state.products = action.payload.products || action.payload;
            state.total = action.payload.total || action.payload.length;
            state.totalPages = action.payload.totalPages || 1;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchProducts.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Product by ID
        .addCase(fetchProductById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchProductById.fulfilled, (state, action)=>{
            state.loading = false;
            state.currentProduct = action.payload;
            state.error = null;
        }).addCase(fetchProductById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Create Product
        .addCase(createProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(createProduct.fulfilled, (state, action)=>{
            state.loading = false;
            state.products.unshift(action.payload.product);
            state.total += 1;
            state.error = null;
        }).addCase(createProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Update Product
        .addCase(updateProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(updateProduct.fulfilled, (state, action)=>{
            state.loading = false;
            const index = state.products.findIndex((product)=>product._id === action.payload.product._id);
            if (index !== -1) {
                state.products[index] = action.payload.product;
            }
            if (state.currentProduct && state.currentProduct._id === action.payload.product._id) {
                state.currentProduct = action.payload.product;
            }
            state.error = null;
        }).addCase(updateProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Delete Product
        .addCase(deleteProduct.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(deleteProduct.fulfilled, (state, action)=>{
            state.loading = false;
            state.products = state.products.filter((product)=>product._id !== action.payload.id);
            state.total -= 1;
            if (state.currentProduct && state.currentProduct._id === action.payload.id) {
                state.currentProduct = null;
            }
            state.error = null;
        }).addCase(deleteProduct.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentProduct, setCurrentPage } = productsSlice.actions;
const __TURBOPACK__default__export__ = productsSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/purchasesSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentPurchase",
    ()=>clearCurrentPurchase,
    "clearError",
    ()=>clearError,
    "createPurchase",
    ()=>createPurchase,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deletePurchase",
    ()=>deletePurchase,
    "fetchPurchaseById",
    ()=>fetchPurchaseById,
    "fetchPurchases",
    ()=>fetchPurchases,
    "setCurrentPage",
    ()=>setCurrentPage,
    "updatePurchase",
    ()=>updatePurchase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchPurchases = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("purchases/fetchAll", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getPurchases();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchPurchaseById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("purchases/fetchById", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getPurchase(id);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const createPurchase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("purchases/create", async (purchaseData, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createPurchase(purchaseData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const updatePurchase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("purchases/update", async (param, param1)=>{
    let { id, data } = param, { rejectWithValue } = param1;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].updatePurchase(id, data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const deletePurchase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("purchases/delete", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].deletePurchase(id);
        return {
            id,
            response
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    purchases: [],
    currentPurchase: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    lastFetched: null
};
const purchasesSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "purchases",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentPurchase: (state)=>{
            state.currentPurchase = null;
        },
        setCurrentPage: (state, action)=>{
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch All Purchases
        .addCase(fetchPurchases.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchPurchases.fulfilled, (state, action)=>{
            state.loading = false;
            state.purchases = action.payload.purchases || action.payload;
            state.total = action.payload.total || action.payload.length;
            state.totalPages = action.payload.totalPages || 1;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchPurchases.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Purchase by ID
        .addCase(fetchPurchaseById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchPurchaseById.fulfilled, (state, action)=>{
            state.loading = false;
            state.currentPurchase = action.payload;
            state.error = null;
        }).addCase(fetchPurchaseById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Create Purchase
        .addCase(createPurchase.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(createPurchase.fulfilled, (state, action)=>{
            state.loading = false;
            state.purchases.unshift(action.payload.purchase);
            state.total += 1;
            state.error = null;
        }).addCase(createPurchase.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Update Purchase
        .addCase(updatePurchase.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(updatePurchase.fulfilled, (state, action)=>{
            state.loading = false;
            const index = state.purchases.findIndex((purchase)=>purchase._id === action.payload.purchase._id);
            if (index !== -1) {
                state.purchases[index] = action.payload.purchase;
            }
            if (state.currentPurchase && state.currentPurchase._id === action.payload.purchase._id) {
                state.currentPurchase = action.payload.purchase;
            }
            state.error = null;
        }).addCase(updatePurchase.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Delete Purchase
        .addCase(deletePurchase.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(deletePurchase.fulfilled, (state, action)=>{
            state.loading = false;
            state.purchases = state.purchases.filter((purchase)=>purchase._id !== action.payload.id);
            state.total -= 1;
            if (state.currentPurchase && state.currentPurchase._id === action.payload.id) {
                state.currentPurchase = null;
            }
            state.error = null;
        }).addCase(deletePurchase.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentPurchase, setCurrentPage } = purchasesSlice.actions;
const __TURBOPACK__default__export__ = purchasesSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store/slices/vendorsSlice.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCurrentVendor",
    ()=>clearCurrentVendor,
    "clearError",
    ()=>clearError,
    "createVendor",
    ()=>createVendor,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deleteVendor",
    ()=>deleteVendor,
    "fetchVendorById",
    ()=>fetchVendorById,
    "fetchVendors",
    ()=>fetchVendors,
    "setCurrentPage",
    ()=>setCurrentPage,
    "updateVendor",
    ()=>updateVendor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
;
const fetchVendors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("vendors/fetchAll", async (_, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getVendors();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const fetchVendorById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("vendors/fetchById", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getVendor(id);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const createVendor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("vendors/create", async (vendorData, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createVendor(vendorData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const updateVendor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("vendors/update", async (param, param1)=>{
    let { id, data } = param, { rejectWithValue } = param1;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].updateVendor(id, data);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const deleteVendor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("vendors/delete", async (id, param)=>{
    let { rejectWithValue } = param;
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].deleteVendor(id);
        return {
            id,
            response
        };
    } catch (error) {
        return rejectWithValue(error.message);
    }
});
const initialState = {
    vendors: [],
    currentVendor: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
    lastFetched: null
};
const vendorsSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "vendors",
    initialState,
    reducers: {
        clearError: (state)=>{
            state.error = null;
        },
        clearCurrentVendor: (state)=>{
            state.currentVendor = null;
        },
        setCurrentPage: (state, action)=>{
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder)=>{
        builder// Fetch All Vendors
        .addCase(fetchVendors.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchVendors.fulfilled, (state, action)=>{
            state.loading = false;
            state.vendors = action.payload.vendors || action.payload;
            state.total = action.payload.total || action.payload.length;
            state.totalPages = action.payload.totalPages || 1;
            state.lastFetched = new Date().toISOString();
            state.error = null;
        }).addCase(fetchVendors.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Fetch Vendor by ID
        .addCase(fetchVendorById.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(fetchVendorById.fulfilled, (state, action)=>{
            state.loading = false;
            state.currentVendor = action.payload;
            state.error = null;
        }).addCase(fetchVendorById.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Create Vendor
        .addCase(createVendor.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(createVendor.fulfilled, (state, action)=>{
            state.loading = false;
            state.vendors.unshift(action.payload.vendor);
            state.total += 1;
            state.error = null;
        }).addCase(createVendor.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Update Vendor
        .addCase(updateVendor.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(updateVendor.fulfilled, (state, action)=>{
            state.loading = false;
            const index = state.vendors.findIndex((vendor)=>vendor._id === action.payload.vendor._id);
            if (index !== -1) {
                state.vendors[index] = action.payload.vendor;
            }
            if (state.currentVendor && state.currentVendor._id === action.payload.vendor._id) {
                state.currentVendor = action.payload.vendor;
            }
            state.error = null;
        }).addCase(updateVendor.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        })// Delete Vendor
        .addCase(deleteVendor.pending, (state)=>{
            state.loading = true;
            state.error = null;
        }).addCase(deleteVendor.fulfilled, (state, action)=>{
            state.loading = false;
            state.vendors = state.vendors.filter((vendor)=>vendor._id !== action.payload.id);
            state.total -= 1;
            if (state.currentVendor && state.currentVendor._id === action.payload.id) {
                state.currentVendor = null;
            }
            state.error = null;
        }).addCase(deleteVendor.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});
const { clearError, clearCurrentVendor, setCurrentPage } = vendorsSlice.actions;
const __TURBOPACK__default__export__ = vendorsSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/store.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dispatch",
    ()=>dispatch,
    "getState",
    ()=>getState,
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/authSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/dashboardSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$salesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/salesSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$customersSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/customersSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$productsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/productsSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$purchasesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/purchasesSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$vendorsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/vendorsSlice.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        dashboard: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        sales: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$salesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        customers: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$customersSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        products: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$productsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        purchases: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$purchasesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        vendors: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$vendorsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    },
    middleware: (getDefaultMiddleware)=>getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE'
                ],
                // Ignore these field paths in all actions
                ignoredActionPaths: [
                    'meta.arg',
                    'payload.timestamp'
                ],
                // Ignore these paths in the state
                ignoredPaths: [
                    'items.dates'
                ]
            }
        })
});
const getState = store.getState;
const dispatch = store.dispatch;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/providers.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store.js [app-client] (ecmascript)");
'use client';
;
;
;
function Providers(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/lib/providers.jsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_lib_c8c1babb._.js.map