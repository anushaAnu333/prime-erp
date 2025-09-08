import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  overview: {
    totalSales: 0,
    totalPurchases: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
  },
  recentActivity: {
    sales: [],
    purchases: [],
  },
  monthlyStats: {
    sales: [],
  },
  salesTrend: [],
  purchasesTrend: [],
  topProducts: [],
  topCustomers: [],
  loading: false,
  error: null,
};

// Async thunk for fetching dashboard data with caching
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        credentials: 'include', // Include cookies for NextAuth session
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch dashboard data');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);


const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state, action) => {
      state.loading = false;
      state.overview = action.payload.overview;
      state.recentActivity = action.payload.recentActivity;
      state.monthlyStats = action.payload.monthlyStats;
      state.salesTrend = action.payload.salesTrend;
      state.purchasesTrend = action.payload.purchasesTrend;
      state.topProducts = action.payload.topProducts;
      state.topCustomers = action.payload.topCustomers;
      state.error = null;
    },
    fetchDashboardFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.overview || state.overview;
        state.recentActivity = action.payload.recentActivity || state.recentActivity;
        state.monthlyStats = action.payload.monthlyStats || state.monthlyStats;
        state.salesTrend = action.payload.salesTrend || state.salesTrend;
        state.purchasesTrend = action.payload.purchasesTrend || state.purchasesTrend;
        state.topProducts = action.payload.topProducts || state.topProducts;
        state.topCustomers = action.payload.topCustomers || state.topCustomers;
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { fetchDashboardStart, fetchDashboardSuccess, fetchDashboardFailure, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;