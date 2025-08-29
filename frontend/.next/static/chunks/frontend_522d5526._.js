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
    "useCustomers",
    ()=>useCustomers,
    "useCustomersError",
    ()=>useCustomersError,
    "useCustomersList",
    ()=>useCustomersList,
    "useCustomersLoading",
    ()=>useCustomersLoading,
    "useDashboardData",
    ()=>useDashboardData,
    "useDashboardOverview",
    ()=>useDashboardOverview,
    "useDashboardSalesTrend",
    ()=>useDashboardSalesTrend,
    "useDashboardTopProducts",
    ()=>useDashboardTopProducts,
    "useProducts",
    ()=>useProducts,
    "useProductsError",
    ()=>useProductsError,
    "useProductsList",
    ()=>useProductsList,
    "useProductsLoading",
    ()=>useProductsLoading,
    "usePurchases",
    ()=>usePurchases,
    "usePurchasesError",
    ()=>usePurchasesError,
    "usePurchasesList",
    ()=>usePurchasesList,
    "usePurchasesLoading",
    ()=>usePurchasesLoading,
    "useSales",
    ()=>useSales,
    "useSalesError",
    ()=>useSalesError,
    "useSalesList",
    ()=>useSalesList,
    "useSalesLoading",
    ()=>useSalesLoading,
    "useVendors",
    ()=>useVendors,
    "useVendorsError",
    ()=>useVendorsError,
    "useVendorsList",
    ()=>useVendorsList,
    "useVendorsLoading",
    ()=>useVendorsLoading
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature(), _s22 = __turbopack_context__.k.signature(), _s23 = __turbopack_context__.k.signature(), _s24 = __turbopack_context__.k.signature();
;
const useAppDispatch = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"];
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSelector"];
const useAuth = ()=>{
    _s();
    return useAppSelector({
        "useAuth.useAppSelector": (state)=>state.auth
    }["useAuth.useAppSelector"]);
};
_s(useAuth, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardData = ()=>{
    _s1();
    return useAppSelector({
        "useDashboardData.useAppSelector": (state)=>state.dashboard
    }["useDashboardData.useAppSelector"]);
};
_s1(useDashboardData, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardOverview = ()=>{
    _s2();
    return useAppSelector({
        "useDashboardOverview.useAppSelector": (state)=>state.dashboard.overview
    }["useDashboardOverview.useAppSelector"]);
};
_s2(useDashboardOverview, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardSalesTrend = ()=>{
    _s3();
    return useAppSelector({
        "useDashboardSalesTrend.useAppSelector": (state)=>state.dashboard.salesTrend
    }["useDashboardSalesTrend.useAppSelector"]);
};
_s3(useDashboardSalesTrend, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useDashboardTopProducts = ()=>{
    _s4();
    return useAppSelector({
        "useDashboardTopProducts.useAppSelector": (state)=>state.dashboard.topProducts
    }["useDashboardTopProducts.useAppSelector"]);
};
_s4(useDashboardTopProducts, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSalesList = ()=>{
    _s5();
    return useAppSelector({
        "useSalesList.useAppSelector": (state)=>state.sales
    }["useSalesList.useAppSelector"]);
};
_s5(useSalesList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSales = ()=>{
    _s6();
    return useAppSelector({
        "useSales.useAppSelector": (state)=>state.sales.sales
    }["useSales.useAppSelector"]);
};
_s6(useSales, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSalesLoading = ()=>{
    _s7();
    return useAppSelector({
        "useSalesLoading.useAppSelector": (state)=>state.sales.loading
    }["useSalesLoading.useAppSelector"]);
};
_s7(useSalesLoading, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useSalesError = ()=>{
    _s8();
    return useAppSelector({
        "useSalesError.useAppSelector": (state)=>state.sales.error
    }["useSalesError.useAppSelector"]);
};
_s8(useSalesError, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomersList = ()=>{
    _s9();
    return useAppSelector({
        "useCustomersList.useAppSelector": (state)=>state.customers
    }["useCustomersList.useAppSelector"]);
};
_s9(useCustomersList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomers = ()=>{
    _s10();
    return useAppSelector({
        "useCustomers.useAppSelector": (state)=>state.customers.customers
    }["useCustomers.useAppSelector"]);
};
_s10(useCustomers, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomersLoading = ()=>{
    _s11();
    return useAppSelector({
        "useCustomersLoading.useAppSelector": (state)=>state.customers.loading
    }["useCustomersLoading.useAppSelector"]);
};
_s11(useCustomersLoading, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useCustomersError = ()=>{
    _s12();
    return useAppSelector({
        "useCustomersError.useAppSelector": (state)=>state.customers.error
    }["useCustomersError.useAppSelector"]);
};
_s12(useCustomersError, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProductsList = ()=>{
    _s13();
    return useAppSelector({
        "useProductsList.useAppSelector": (state)=>state.products
    }["useProductsList.useAppSelector"]);
};
_s13(useProductsList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProducts = ()=>{
    _s14();
    return useAppSelector({
        "useProducts.useAppSelector": (state)=>state.products.products
    }["useProducts.useAppSelector"]);
};
_s14(useProducts, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProductsLoading = ()=>{
    _s15();
    return useAppSelector({
        "useProductsLoading.useAppSelector": (state)=>state.products.loading
    }["useProductsLoading.useAppSelector"]);
};
_s15(useProductsLoading, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useProductsError = ()=>{
    _s16();
    return useAppSelector({
        "useProductsError.useAppSelector": (state)=>state.products.error
    }["useProductsError.useAppSelector"]);
};
_s16(useProductsError, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchasesList = ()=>{
    _s17();
    return useAppSelector({
        "usePurchasesList.useAppSelector": (state)=>state.purchases
    }["usePurchasesList.useAppSelector"]);
};
_s17(usePurchasesList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchases = ()=>{
    _s18();
    return useAppSelector({
        "usePurchases.useAppSelector": (state)=>state.purchases.purchases
    }["usePurchases.useAppSelector"]);
};
_s18(usePurchases, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchasesLoading = ()=>{
    _s19();
    return useAppSelector({
        "usePurchasesLoading.useAppSelector": (state)=>state.purchases.loading
    }["usePurchasesLoading.useAppSelector"]);
};
_s19(usePurchasesLoading, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const usePurchasesError = ()=>{
    _s20();
    return useAppSelector({
        "usePurchasesError.useAppSelector": (state)=>state.purchases.error
    }["usePurchasesError.useAppSelector"]);
};
_s20(usePurchasesError, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendorsList = ()=>{
    _s21();
    return useAppSelector({
        "useVendorsList.useAppSelector": (state)=>state.vendors
    }["useVendorsList.useAppSelector"]);
};
_s21(useVendorsList, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendors = ()=>{
    _s22();
    return useAppSelector({
        "useVendors.useAppSelector": (state)=>state.vendors.vendors
    }["useVendors.useAppSelector"]);
};
_s22(useVendors, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendorsLoading = ()=>{
    _s23();
    return useAppSelector({
        "useVendorsLoading.useAppSelector": (state)=>state.vendors.loading
    }["useVendorsLoading.useAppSelector"]);
};
_s23(useVendorsLoading, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
const useVendorsError = ()=>{
    _s24();
    return useAppSelector({
        "useVendorsError.useAppSelector": (state)=>state.vendors.error
    }["useVendorsError.useAppSelector"]);
};
_s24(useVendorsError, "bRaY7Fsh/GrWHjZMhGvF04Z7BZI=", false, function() {
    return [
        useAppSelector
    ];
});
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
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const ReduxTest = ()=>{
    var _dashboardData_overview, _dashboardData_overview1, _dashboardData_overview2, _dashboardData_salesTrend, _dashboardData_topProducts, _salesData_sales, _dashboardData_salesTrend1, _dashboardData_topProducts1, _salesData_sales1, _salesData_sales2;
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const dashboardData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const salesData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSalesList"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReduxTest.useEffect": ()=>{
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
                lineNumber: 21,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 mb-4",
                                children: "Dashboard Data (Redux)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 26,
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
                                        lineNumber: 30,
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
                                        lineNumber: 33,
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
                                        lineNumber: 36,
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
                                        lineNumber: 39,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Top Products: ",
                                            ((_dashboardData_topProducts = dashboardData.topProducts) === null || _dashboardData_topProducts === void 0 ? void 0 : _dashboardData_topProducts.length) || 0,
                                            " items"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 42,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Loading: ",
                                            dashboardData.loading ? "Yes" : "No"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 45,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    dashboardData.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-red-600",
                                        children: [
                                            "Error: ",
                                            dashboardData.error
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 49,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 mb-4",
                                children: "Sales Data (Redux)"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Total Sales: ",
                                            ((_salesData_sales = salesData.sales) === null || _salesData_sales === void 0 ? void 0 : _salesData_sales.length) || 0
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 60,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-600",
                                        children: [
                                            "Loading: ",
                                            salesData.loading ? "Yes" : "No"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 63,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    salesData.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-red-600",
                                        children: [
                                            "Error: ",
                                            salesData.error
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                                        lineNumber: 67,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/ReduxTest.jsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/ReduxTest.jsx",
                lineNumber: 23,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "Redux State Structure"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 75,
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
                                    topProducts: ((_dashboardData_topProducts1 = dashboardData.topProducts) === null || _dashboardData_topProducts1 === void 0 ? void 0 : _dashboardData_topProducts1.length) || 0,
                                    loading: dashboardData.loading,
                                    error: dashboardData.error
                                },
                                sales: {
                                    count: ((_salesData_sales1 = salesData.sales) === null || _salesData_sales1 === void 0 ? void 0 : _salesData_sales1.length) || 0,
                                    sample: ((_salesData_sales2 = salesData.sales) === null || _salesData_sales2 === void 0 ? void 0 : _salesData_sales2.slice(0, 2).map((s)=>({
                                            id: s._id,
                                            invoiceNo: s.invoiceNo,
                                            total: s.total
                                        }))) || [],
                                    loading: salesData.loading,
                                    error: salesData.error
                                }
                            }, null, 2)
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/ReduxTest.jsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/ReduxTest.jsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/ReduxTest.jsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/ReduxTest.jsx",
        lineNumber: 20,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ReduxTest, "dJfix0h7GO+ylcwurGoxoCutQSU=", false, function() {
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
"[project]/frontend/components/DebugRedux.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/store/slices/dashboardSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/api.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const DebugRedux = ()=>{
    var _dashboardData_salesTrend, _dashboardData_topProducts;
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const dashboardData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const { loading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"])();
    const [debugInfo, setDebugInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DebugRedux.useEffect": ()=>{
            const testRedux = {
                "DebugRedux.useEffect.testRedux": async ()=>{
                    console.log("Testing Redux...");
                    // Test direct API call first
                    try {
                        console.log("Testing direct API call...");
                        const directResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getDashboard();
                        console.log("Direct API response:", directResponse);
                        setDebugInfo({
                            "DebugRedux.useEffect.testRedux": (prev)=>({
                                    ...prev,
                                    directApiResponse: directResponse
                                })
                        }["DebugRedux.useEffect.testRedux"]);
                    } catch (error) {
                        console.error("Direct API error:", error);
                        setDebugInfo({
                            "DebugRedux.useEffect.testRedux": (prev)=>({
                                    ...prev,
                                    directApiError: error.message
                                })
                        }["DebugRedux.useEffect.testRedux"]);
                    }
                    // Test Redux action
                    try {
                        console.log("Dispatching Redux action...");
                        const result = await dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchDashboardData"])()).unwrap();
                        console.log("Redux action result:", result);
                        setDebugInfo({
                            "DebugRedux.useEffect.testRedux": (prev)=>({
                                    ...prev,
                                    reduxActionResult: result
                                })
                        }["DebugRedux.useEffect.testRedux"]);
                    } catch (error) {
                        console.error("Redux action error:", error);
                        setDebugInfo({
                            "DebugRedux.useEffect.testRedux": (prev)=>({
                                    ...prev,
                                    reduxActionError: error.message
                                })
                        }["DebugRedux.useEffect.testRedux"]);
                    }
                }
            }["DebugRedux.useEffect.testRedux"];
            testRedux();
        }
    }["DebugRedux.useEffect"], [
        dispatch
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-bold",
                children: "Redux Debug"
            }, void 0, false, {
                fileName: "[project]/frontend/components/DebugRedux.jsx",
                lineNumber: 47,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-100 p-4 rounded",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold mb-2",
                        children: "Current State:"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "text-xs",
                        children: JSON.stringify({
                            loading,
                            error,
                            hasData: !!dashboardData,
                            overview: dashboardData.overview,
                            salesTrend: ((_dashboardData_salesTrend = dashboardData.salesTrend) === null || _dashboardData_salesTrend === void 0 ? void 0 : _dashboardData_salesTrend.length) || 0,
                            topProducts: ((_dashboardData_topProducts = dashboardData.topProducts) === null || _dashboardData_topProducts === void 0 ? void 0 : _dashboardData_topProducts.length) || 0
                        }, null, 2)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/DebugRedux.jsx",
                lineNumber: 49,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-blue-100 p-4 rounded",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold mb-2",
                        children: "Debug Info:"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "text-xs",
                        children: JSON.stringify(debugInfo, null, 2)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/DebugRedux.jsx",
                lineNumber: 67,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-green-100 p-4 rounded",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold mb-2",
                        children: "Actions:"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: async ()=>{
                            try {
                                const result = await dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$store$2f$slices$2f$dashboardSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchDashboardData"])()).unwrap();
                                console.log("Manual dispatch result:", result);
                                setDebugInfo((prev)=>({
                                        ...prev,
                                        manualDispatchResult: result
                                    }));
                            } catch (error) {
                                console.error("Manual dispatch error:", error);
                                setDebugInfo((prev)=>({
                                        ...prev,
                                        manualDispatchError: error.message
                                    }));
                            }
                        },
                        className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700",
                        children: "Fetch Dashboard Data"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/DebugRedux.jsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/DebugRedux.jsx",
                lineNumber: 74,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/DebugRedux.jsx",
        lineNumber: 46,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(DebugRedux, "iCD4OYbVvgCD+uT1byPG5WFznQE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDashboardData"]
    ];
});
_c = DebugRedux;
const __TURBOPACK__default__export__ = DebugRedux;
var _c;
__turbopack_context__.k.register(_c, "DebugRedux");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$DebugRedux$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/DebugRedux.jsx [app-client] (ecmascript)");
"use client";
;
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
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600 mb-8",
                    children: "This page demonstrates the Redux implementation in the Prima ERP application. The data below is fetched using Redux actions and displayed using Redux state."
                }, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 13,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$DebugRedux$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 19,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ReduxTest$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 21,
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
                            lineNumber: 24,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "text-sm text-blue-800 space-y-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Centralized state management"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Automatic caching and optimized re-renders"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 29,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Consistent data flow across components"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 30,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Better debugging with Redux DevTools"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 31,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "• Scalable architecture for large applications"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                                    lineNumber: 32,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/app/test-redux/page.jsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/app/test-redux/page.jsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/app/test-redux/page.jsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/app/test-redux/page.jsx",
        lineNumber: 8,
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

//# sourceMappingURL=frontend_522d5526._.js.map