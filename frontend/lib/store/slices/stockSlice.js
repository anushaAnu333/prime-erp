import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for stock operations
export const fetchStocks = createAsyncThunk(
  'stock/fetchStocks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/stock?${queryString}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stocks');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStockById = createAsyncThunk(
  'stock/fetchStockById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stock/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stock');
      }
      
      const data = await response.json();
      return data.stock;
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
        credentials: 'include',
        body: JSON.stringify(stockData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create stock');
      }
      
      const data = await response.json();
      return data.stock;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStock = createAsyncThunk(
  'stock/updateStock',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }
      
      const result = await response.json();
      return result.stock;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStock = createAsyncThunk(
  'stock/deleteStock',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stock/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stock');
      }
      
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delivery Stock async thunks
export const fetchDeliveryStocks = createAsyncThunk(
  'stock/fetchDeliveryStocks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/stock/delivery-stock?${queryString}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch delivery stocks');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDeliveryStock = createAsyncThunk(
  'stock/createDeliveryStock',
  async (deliveryStockData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/stock/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(deliveryStockData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create delivery stock');
      }
      
      const data = await response.json();
      return data.deliveryStock;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeDelivery = createAsyncThunk(
  'stock/completeDelivery',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stock/delivery-stock?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'Completed' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete delivery');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Main stock data
  stocks: [],
  currentStock: null,
  summary: {},
  
  // Delivery stock data
  deliveryStocks: [],
  deliverySummary: {},
  
  // Loading states
  loading: false,
  deliveryLoading: false,
  
  // Error states
  error: null,
  deliveryError: null,
  
  // Metadata
  lastFetched: null,
  deliveryLastFetched: null,
};

// Stock slice
const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.deliveryError = null;
    },
    clearCurrentStock: (state) => {
      state.currentStock = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setDeliveryFilters: (state, action) => {
      state.deliveryFilters = action.payload;
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
        state.summary = action.payload.summary || {};
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch stock by ID
      .addCase(fetchStockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStock = action.payload;
      })
      .addCase(fetchStockById.rejected, (state, action) => {
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
        state.stocks.unshift(action.payload);
        state.summary.totalProducts = (state.summary.totalProducts || 0) + 1;
      })
      .addCase(createStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update stock
      .addCase(updateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.stocks.findIndex(stock => stock._id === action.payload._id);
        if (index !== -1) {
          state.stocks[index] = action.payload;
        }
        if (state.currentStock && state.currentStock._id === action.payload._id) {
          state.currentStock = action.payload;
        }
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete stock
      .addCase(deleteStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stocks = state.stocks.filter(stock => stock._id !== action.payload);
        state.summary.totalProducts = Math.max(0, (state.summary.totalProducts || 1) - 1);
      })
      .addCase(deleteStock.rejected, (state, action) => {
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
        state.deliverySummary = action.payload.summary || {};
        state.deliveryLastFetched = new Date().toISOString();
      })
      .addCase(fetchDeliveryStocks.rejected, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryError = action.payload;
      })
      
      // Create delivery stock
      .addCase(createDeliveryStock.pending, (state) => {
        state.deliveryLoading = true;
        state.deliveryError = null;
      })
      .addCase(createDeliveryStock.fulfilled, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryStocks.unshift(action.payload);
      })
      .addCase(createDeliveryStock.rejected, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryError = action.payload;
      })
      
      // Complete delivery
      .addCase(completeDelivery.pending, (state) => {
        state.deliveryLoading = true;
        state.deliveryError = null;
      })
      .addCase(completeDelivery.fulfilled, (state, action) => {
        state.deliveryLoading = false;
        // Update the delivery stock status
        const index = state.deliveryStocks.findIndex(
          ds => ds._id === action.payload.stock.id
        );
        if (index !== -1) {
          state.deliveryStocks[index].status = 'Completed';
        }
      })
      .addCase(completeDelivery.rejected, (state, action) => {
        state.deliveryLoading = false;
        state.deliveryError = action.payload;
      });
  },
});

export const { clearError, clearCurrentStock, setFilters, setDeliveryFilters } = stockSlice.actions;

export default stockSlice.reducer;

