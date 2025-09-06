import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getDashboard();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
  lastFetched: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        // Direct assignment of response data to state
        state.overview = action.payload.overview || state.overview;
        state.recentActivity =
          action.payload.recentActivity || state.recentActivity;
        state.monthlyStats = action.payload.monthlyStats || state.monthlyStats;
        state.salesTrend = action.payload.salesTrend || state.salesTrend;
        state.purchasesTrend =
          action.payload.purchasesTrend || state.purchasesTrend;
        state.topProducts = action.payload.topProducts || state.topProducts;
        state.topCustomers = action.payload.topCustomers || state.topCustomers;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        // Handle stats response
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
