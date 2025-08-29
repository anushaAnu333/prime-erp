import { useDispatch, useSelector } from "react-redux";

// Typed versions of useDispatch and useSelector
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

// Auth hooks
export const useAuth = () => useAppSelector((state) => state.auth);

// Dashboard hooks
export const useDashboardData = () =>
  useAppSelector((state) => state.dashboard);
export const useDashboardOverview = () =>
  useAppSelector((state) => state.dashboard.overview);
export const useDashboardSalesTrend = () =>
  useAppSelector((state) => state.dashboard.salesTrend);
export const useDashboardTopProducts = () =>
  useAppSelector((state) => state.dashboard.topProducts);

// Sales hooks
export const useSalesList = () => useAppSelector((state) => state.sales);
export const useSales = () => useAppSelector((state) => state.sales.sales);
export const useSalesLoading = () =>
  useAppSelector((state) => state.sales.loading);
export const useSalesError = () => useAppSelector((state) => state.sales.error);

// Customers hooks
export const useCustomersList = () =>
  useAppSelector((state) => state.customers);
export const useCustomers = () =>
  useAppSelector((state) => state.customers.customers);
export const useCustomersLoading = () =>
  useAppSelector((state) => state.customers.loading);
export const useCustomersError = () =>
  useAppSelector((state) => state.customers.error);

// Products hooks
export const useProductsList = () => useAppSelector((state) => state.products);
export const useProducts = () =>
  useAppSelector((state) => state.products.products);
export const useProductsLoading = () =>
  useAppSelector((state) => state.products.loading);
export const useProductsError = () =>
  useAppSelector((state) => state.products.error);

// Purchases hooks
export const usePurchasesList = () =>
  useAppSelector((state) => state.purchases);
export const usePurchases = () =>
  useAppSelector((state) => state.purchases.purchases);
export const usePurchasesLoading = () =>
  useAppSelector((state) => state.purchases.loading);
export const usePurchasesError = () =>
  useAppSelector((state) => state.purchases.error);

// Vendors hooks
export const useVendorsList = () => useAppSelector((state) => state.vendors);
export const useVendors = () =>
  useAppSelector((state) => state.vendors.vendors);
export const useVendorsLoading = () =>
  useAppSelector((state) => state.vendors.loading);
export const useVendorsError = () =>
  useAppSelector((state) => state.vendors.error);
