import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api";

// Async thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getSales();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  "sales/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.getSale(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSale = createAsyncThunk(
  "sales/create",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createSale(saleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSale = createAsyncThunk(
  "sales/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateSale(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSale = createAsyncThunk(
  "sales/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.deleteSale(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sales: [],
  currentSale: null,
  loading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  lastFetched: null,
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.sales || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sale by ID
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload.sale);
        state.total += 1;
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(
          (sale) => sale._id === action.payload.sale._id
        );
        if (index !== -1) {
          state.sales[index] = action.payload.sale;
        }
        if (
          state.currentSale &&
          state.currentSale._id === action.payload.sale._id
        ) {
          state.currentSale = action.payload.sale;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Sale
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter(
          (sale) => sale._id !== action.payload.id
        );
        state.total -= 1;
        if (state.currentSale && state.currentSale._id === action.payload.id) {
          state.currentSale = null;
        }
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentSale, setCurrentPage } =
  salesSlice.actions;
export default salesSlice.reducer;
