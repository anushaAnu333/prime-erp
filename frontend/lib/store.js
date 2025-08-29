import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import dashboardReducer from './store/slices/dashboardSlice';
import salesReducer from './store/slices/salesSlice';
import customersReducer from './store/slices/customersSlice';
import productsReducer from './store/slices/productsSlice';
import purchasesReducer from './store/slices/purchasesSlice';
import vendorsReducer from './store/slices/vendorsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    sales: salesReducer,
    customers: customersReducer,
    products: productsReducer,
    purchases: purchasesReducer,
    vendors: vendorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

// Export store types for use in other files
export const getState = store.getState;
export const dispatch = store.dispatch;
