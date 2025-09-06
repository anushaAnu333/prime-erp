import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../lib/store/slices/authSlice';
import dashboardReducer from '../lib/store/slices/dashboardSlice';
import salesReducer from '../lib/store/slices/salesSlice';
import customersReducer from '../lib/store/slices/customersSlice';
import productsReducer from '../lib/store/slices/productsSlice';
import purchasesReducer from '../lib/store/slices/purchasesSlice';
import vendorsReducer from '../lib/store/slices/vendorsSlice';
import stockReducer from '../lib/store/slices/stockSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    sales: salesReducer,
    customers: customersReducer,
    products: productsReducer,
    purchases: purchasesReducer,
    vendors: vendorsReducer,
    stock: stockReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
