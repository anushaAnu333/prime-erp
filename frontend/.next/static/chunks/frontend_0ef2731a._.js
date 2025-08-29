(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/lib/hooks.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppDispatch",
    ()=>useAppDispatch,
    "useAppSelector",
    ()=>useAppSelector,
    "useAuth",
    ()=>useAuth,
    "useCurrentCustomer",
    ()=>useCurrentCustomer,
    "useCurrentProduct",
    ()=>useCurrentProduct,
    "useCurrentPurchase",
    ()=>useCurrentPurchase,
    "useCurrentSale",
    ()=>useCurrentSale,
    "useCurrentVendor",
    ()=>useCurrentVendor,
    "useCustomers",
    ()=>useCustomers,
    "useCustomersList",
    ()=>useCustomersList,
    "useDashboard",
    ()=>useDashboard,
    "useDashboardData",
    ()=>useDashboardData,
    "useDashboardStats",
    ()=>useDashboardStats,
    "useIsAuthenticated",
    ()=>useIsAuthenticated,
    "useProducts",
    ()=>useProducts,
    "useProductsList",
    ()=>useProductsList,
    "usePurchases",
    ()=>usePurchases,
    "usePurchasesList",
    ()=>usePurchasesList,
    "useSales",
    ()=>useSales,
    "useSalesList",
    ()=>useSalesList,
    "useUser",
    ()=>useUser,
    "useVendors",
    ()=>useVendors,
    "useVendorsList",
    ()=>useVendorsList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature();
;
const useAppDispatch = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"])();
};
_s(useAppDispatch, "jI3HA1r1Cumjdbu14H7G+TUj798=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"]
    ];
});
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSelector"];
const useAuth = ()=>{
    _s1();
    return useAppSelector({
        "useAuth.useAppSelector": (state)=>state.auth
    }["useAuth.useAppSelector"]);
};
_s1(useAuth, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useUser = ()=>{
    _s2();
    return useAppSelector({
        "useUser.useAppSelector": (state)=>state.auth.user
    }["useUser.useAppSelector"]);
};
_s2(useUser, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useIsAuthenticated = ()=>{
    _s3();
    return useAppSelector({
        "useIsAuthenticated.useAppSelector": (state)=>state.auth.isAuthenticated
    }["useIsAuthenticated.useAppSelector"]);
};
_s3(useIsAuthenticated, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboard = ()=>{
    _s4();
    return useAppSelector({
        "useDashboard.useAppSelector": (state)=>state.dashboard
    }["useDashboard.useAppSelector"]);
};
_s4(useDashboard, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardData = ()=>{
    _s5();
    return useAppSelector({
        "useDashboardData.useAppSelector": (state)=>state.dashboard.data
    }["useDashboardData.useAppSelector"]);
};
_s5(useDashboardData, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardStats = ()=>{
    _s6();
    return useAppSelector({
        "useDashboardStats.useAppSelector": (state)=>state.dashboard.stats
    }["useDashboardStats.useAppSelector"]);
};
_s6(useDashboardStats, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSales = ()=>{
    _s7();
    return useAppSelector({
        "useSales.useAppSelector": (state)=>state.sales
    }["useSales.useAppSelector"]);
};
_s7(useSales, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSalesList = ()=>{
    _s8();
    return useAppSelector({
        "useSalesList.useAppSelector": (state)=>state.sales.sales
    }["useSalesList.useAppSelector"]);
};
_s8(useSalesList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCurrentSale = ()=>{
    _s9();
    return useAppSelector({
        "useCurrentSale.useAppSelector": (state)=>state.sales.currentSale
    }["useCurrentSale.useAppSelector"]);
};
_s9(useCurrentSale, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomers = ()=>{
    _s10();
    return useAppSelector({
        "useCustomers.useAppSelector": (state)=>state.customers
    }["useCustomers.useAppSelector"]);
};
_s10(useCustomers, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomersList = ()=>{
    _s11();
    return useAppSelector({
        "useCustomersList.useAppSelector": (state)=>state.customers.customers
    }["useCustomersList.useAppSelector"]);
};
_s11(useCustomersList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCurrentCustomer = ()=>{
    _s12();
    return useAppSelector({
        "useCurrentCustomer.useAppSelector": (state)=>state.customers.currentCustomer
    }["useCurrentCustomer.useAppSelector"]);
};
_s12(useCurrentCustomer, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProducts = ()=>{
    _s13();
    return useAppSelector({
        "useProducts.useAppSelector": (state)=>state.products
    }["useProducts.useAppSelector"]);
};
_s13(useProducts, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProductsList = ()=>{
    _s14();
    return useAppSelector({
        "useProductsList.useAppSelector": (state)=>state.products.products
    }["useProductsList.useAppSelector"]);
};
_s14(useProductsList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCurrentProduct = ()=>{
    _s15();
    return useAppSelector({
        "useCurrentProduct.useAppSelector": (state)=>state.products.currentProduct
    }["useCurrentProduct.useAppSelector"]);
};
_s15(useCurrentProduct, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchases = ()=>{
    _s16();
    return useAppSelector({
        "usePurchases.useAppSelector": (state)=>state.purchases
    }["usePurchases.useAppSelector"]);
};
_s16(usePurchases, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchasesList = ()=>{
    _s17();
    return useAppSelector({
        "usePurchasesList.useAppSelector": (state)=>state.purchases.purchases
    }["usePurchasesList.useAppSelector"]);
};
_s17(usePurchasesList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCurrentPurchase = ()=>{
    _s18();
    return useAppSelector({
        "useCurrentPurchase.useAppSelector": (state)=>state.purchases.currentPurchase
    }["useCurrentPurchase.useAppSelector"]);
};
_s18(useCurrentPurchase, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendors = ()=>{
    _s19();
    return useAppSelector({
        "useVendors.useAppSelector": (state)=>state.vendors
    }["useVendors.useAppSelector"]);
};
_s19(useVendors, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendorsList = ()=>{
    _s20();
    return useAppSelector({
        "useVendorsList.useAppSelector": (state)=>state.vendors.vendors
    }["useVendorsList.useAppSelector"]);
};
_s20(useVendorsList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCurrentVendor = ()=>{
    _s21();
    return useAppSelector({
        "useCurrentVendor.useAppSelector": (state)=>state.vendors.currentVendor
    }["useCurrentVendor.useAppSelector"]);
};
_s21(useCurrentVendor, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/lib/utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Email validation function
__turbopack_context__.s([
    "capitalize",
    ()=>capitalize,
    "cn",
    ()=>cn,
    "debounce",
    ()=>debounce,
    "deepClone",
    ()=>deepClone,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatPhoneNumber",
    ()=>formatPhoneNumber,
    "generateId",
    ()=>generateId,
    "getInitials",
    ()=>getInitials,
    "getRoleColor",
    ()=>getRoleColor,
    "getRoleDisplayName",
    ()=>getRoleDisplayName,
    "isValidEmail",
    ()=>isValidEmail,
    "isValidPhone",
    ()=>isValidPhone,
    "sleep",
    ()=>sleep,
    "truncate",
    ()=>truncate
]);
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        const later = ()=>{
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function truncate(text) {
    let length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 50;
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}
function formatPhoneNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
}
function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map((word)=>word.charAt(0)).join('').toUpperCase().slice(0, 2);
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item)=>deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for(const key in obj){
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}
function cn() {
    for(var _len = arguments.length, classes = new Array(_len), _key = 0; _key < _len; _key++){
        classes[_key] = arguments[_key];
    }
    return classes.filter(Boolean).join(' ');
}
function getRoleDisplayName(role) {
    const roleNames = {
        admin: 'Administrator',
        manager: 'Manager',
        accountant: 'Accountant',
        agent: 'Agent'
    };
    return roleNames[role] || role;
}
function getRoleColor(role) {
    const roleColors = {
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-blue-100 text-blue-800',
        accountant: 'bg-green-100 text-green-800',
        agent: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/ui/Card.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.js [app-client] (ecmascript)");
;
;
const Card = (param)=>{
    let { children, className = "", padding = "p-6", ...props } = param;
    const cardClasses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-white rounded-lg shadow-sm border border-gray-200", padding, className);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: cardClasses,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/Card.jsx",
        lineNumber: 11,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Card;
// Card Header component
Card.Header = (param)=>{
    let { children, className = "", ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-b border-gray-200 pb-4 mb-4", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/Card.jsx",
        lineNumber: 19,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
// Card Title component
Card.Title = (param)=>{
    let { children, className = "", ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold text-gray-900", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/Card.jsx",
        lineNumber: 28,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
// Card Content component
Card.Content = (param)=>{
    let { children, className = "", ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/Card.jsx",
        lineNumber: 37,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
// Card Footer component
Card.Footer = (param)=>{
    let { children, className = "", ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-t border-gray-200 pt-4 mt-4", className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/components/ui/Card.jsx",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Card;
var _c;
__turbopack_context__.k.register(_c, "Card");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/ReduxTest.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/dashboardSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$salesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/salesSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$Card$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/Card.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const ReduxTest = ()=>{
    var _dashboardData_overview, _dashboardData_overview1, _dashboardData_overview2, _dashboardData_salesTrend, _dashboardData_salesTrend1, _dashboardData_topProducts;
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const dashboardData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const sales = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSalesList"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReduxTest.useEffect": ()=>{
            // Test Redux actions
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchDashboardData"])());
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$salesSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchSales"])());
        }
    }["ReduxTest.useEffect"], [
        dispatch
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-bold text-gray-900",
                children: "Redux Test Component"
            }, void 0, false, {
                fileName: "[project]/frontend/components/ReduxTest.jsx",
                lineNumber: 23,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$Card$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        className: "p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 mb-4",
                                children: "Dashboard Data (Redux)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Total Sales: ",
                                            ((_dashboardData_overview = dashboardData.overview) === null || _dashboardData_overview === void 0 ? void 0 : _dashboardData_overview.totalSales) || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 32,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Total Customers: ",
                                            ((_dashboardData_overview1 = dashboardData.overview) === null || _dashboardData_overview1 === void 0 ? void 0 : _dashboardData_overview1.totalCustomers) || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 35,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Total Products: ",
                                            ((_dashboardData_overview2 = dashboardData.overview) === null || _dashboardData_overview2 === void 0 ? void 0 : _dashboardData_overview2.totalProducts) || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 38,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Sales Trend Data: ",
                                            ((_dashboardData_salesTrend = dashboardData.salesTrend) === null || _dashboardData_salesTrend === void 0 ? void 0 : _dashboardData_salesTrend.length) || 0,
                                            " items"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 41,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 31,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$Card$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        className: "p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 mb-4",
                                children: "Sales Data (Redux)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Total Sales: ",
                                            sales.length
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 53,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    sales.slice(0, 3).map((sale, index)=>{
                                        var _sale_total;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-gray-500",
                                            children: [
                                                sale.invoiceNo,
                                                " - ₹",
                                                ((_sale_total = sale.total) === null || _sale_total === void 0 ? void 0 : _sale_total.toLocaleString()) || 0
                                            ]
                                        }, sale._id || index, true, {
                                            fileName: "[project]/frontend/components/ReduxTest.jsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0));
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/ReduxTest.jsx",
                lineNumber: 25,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$Card$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                className: "p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "Redux State Structure"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-50 p-4 rounded-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                            className: "text-xs text-gray-700 overflow-auto",
                            children: JSON.stringify({
                                dashboard: {
                                    overview: dashboardData.overview,
                                    salesTrend: ((_dashboardData_salesTrend1 = dashboardData.salesTrend) === null || _dashboardData_salesTrend1 === void 0 ? void 0 : _dashboardData_salesTrend1.length) || 0,
                                    topProducts: ((_dashboardData_topProducts = dashboardData.topProducts) === null || _dashboardData_topProducts === void 0 ? void 0 : _dashboardData_topProducts.length) || 0
                                },
                                sales: {
                                    count: sales.length,
                                    sample: sales.slice(0, 2).map((s)=>({
                                            id: s._id,
                                            invoiceNo: s.invoiceNo,
                                            total: s.total
                                        }))
                                }
                            }, null, 2)
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/ReduxTest.jsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/ReduxTest.jsx",
                lineNumber: 63,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/ReduxTest.jsx",
        lineNumber: 22,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ReduxTest, "GYZ12npFYtpcqo+IIYZ2iBvxxHg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSalesList"]
    ];
});
_c = ReduxTest;
const __TURBOPACK__default__export__ = ReduxTest;
var _c;
__turbopack_context__.k.register(_c, "ReduxTest");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/app/test-redux/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestReduxPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ReduxTest$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ReduxTest.jsx [app-client] (ecmascript)");
"use client";
;
;
function TestReduxPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "container mx-auto px-4 py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-3xl font-bold text-gray-900 mb-8",
                    children: "Redux Implementation Test"
                }, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 9,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600 mb-8",
                    children: "This page demonstrates the Redux implementation in the Prima ERP application. The data below is fetched using Redux actions and displayed using Redux state."
                }, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ReduxTest$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8 p-6 bg-blue-50 rounded-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-blue-900 mb-2",
                            children: "Redux Benefits Demonstrated:"
                        }, void 0, false, {
                            fileName: "[project]/frontend/app/test-redux/page.jsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "text-sm text-blue-800 space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Centralized state management"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 25,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Automatic caching and optimized re-renders"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 26,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Consistent data flow across components"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 27,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Better debugging with Redux DevTools"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Scalable architecture for large applications"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/app/test-redux/page.jsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/app/test-redux/page.jsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/app/test-redux/page.jsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = TestReduxPage;
var _c;
__turbopack_context__.k.register(_c, "TestReduxPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_0ef2731a._.js.map