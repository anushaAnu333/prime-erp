import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  stocks: [],
  deliveryStocks: [],
  currentStock: null,
  summary: {
    totalProducts: 0,
    totalOpeningStock: 0,
    totalPurchases: 0,
    totalSales: 0,
    totalClosingStock: 0,
    totalStockGiven: 0,
    totalStockDelivered: 0,
    totalStockAvailable: 0,
    lowStockCount: 0,
    expiredCount: 0,
  },
  deliverySummary: {
    totalDeliveryGuys: 0,
    totalStockAllocated: 0,
    totalStockDelivered: 0,
    totalStockReturned: 0,
    totalStockInHand: 0,
    activeDeliveries: 0,
  },
  loading: false,
  deliveryLoading: false,
  error: null,
  deliveryError: null,
};

// Async thunks
export const fetchStocks = createAsyncThunk(
  'stock/fetchStocks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.lowStock) queryParams.append('lowStock', params.lowStock);
      if (params.expired) queryParams.append('expired', params.expired);
      
      const response = await fetch(`/api/stock?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDeliveryStocks = createAsyncThunk(
  'stock/fetchDeliveryStocks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.deliveryGuyId) queryParams.append('deliveryGuyId', params.deliveryGuyId);
      if (params.status) queryParams.append('status', params.status);
      if (params.date) queryParams.append('date', params.date);
      
      const response = await fetch(`/api/stock/delivery-stock?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch delivery stocks');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeDelivery = createAsyncThunk(
  'stock/completeDelivery',
  async ({ stockId, deliveryData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stock/${stockId}/delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      });
      if (!response.ok) {
        throw new Error('Failed to complete delivery');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createStock = createAsyncThunk(
  'stock/createStock',
  async (stockData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create stock');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    fetchStockStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStockSuccess: (state, action) => {
      state.loading = false;
      state.stocks = action.payload.stocks;
      state.summary = action.payload.summary;
      state.error = null;
    },
    fetchStockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createStockStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createStockSuccess: (state, action) => {
      state.loading = false;
      state.stocks.unshift(action.payload);
      state.error = null;
    },
    createStockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStockStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateStockSuccess: (state, action) => {
      state.loading = false;
      const index = state.stocks.findIndex(stock => stock._id === action.payload._id);
      if (index !== -1) {
        state.stocks[index] = action.payload;
      }
      state.error = null;
    },
    updateStockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteStockStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteStockSuccess: (state, action) => {
      state.loading = false;
      state.stocks = state.stocks.filter(stock => stock._id !== action.payload);
      state.error = null;
    },
    deleteStockFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentStock: (state, action) => {
      state.currentStock = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stocks
      .addCase(fetchStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = action.payload.stocks || [];
        state.summary = action.payload.summary || state.summary;
        state.error = null;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch delivery stocks
      .addCase(fetchDeliveryStocks.pending, (state) => {
        state.deliveryLoading = true;
        state.deliveryError = null;
      })
      .addCase(fetchDeliveryStocks.fulfilled, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryStocks = action.payload.deliveryStocks || [];
        state.deliverySummary = action.payload.summary || state.deliverySummary;
        state.deliveryError = null;
      })
      .addCase(fetchDeliveryStocks.rejected, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryError = action.payload;
      })
      // Complete delivery
      .addCase(completeDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeDelivery.fulfilled, (state, action) => {
        state.loading = false;
        // Update the stock in the list
        const index = state.stocks.findIndex(stock => stock._id === action.payload._id);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(completeDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create stock
      .addCase(createStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks.unshift(action.payload.stock);
        state.error = null;
      })
      .addCase(createStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchStockStart,
  fetchStockSuccess,
  fetchStockFailure,
  createStockStart,
  createStockSuccess,
  createStockFailure,
  updateStockStart,
  updateStockSuccess,
  updateStockFailure,
  deleteStockStart,
  deleteStockSuccess,
  deleteStockFailure,
  setCurrentStock,
  clearError,
} = stockSlice.actions;
export default stockSlice.reducer;