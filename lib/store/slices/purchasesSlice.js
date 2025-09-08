import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const createPurchaseReturn = createAsyncThunk(
  'purchases/createPurchaseReturn',
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/purchases/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create purchase return');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  purchases: [],
  currentPurchase: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    fetchPurchasesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPurchasesSuccess: (state, action) => {
      state.loading = false;
      state.purchases = action.payload.purchases;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.page;
      state.error = null;
    },
    fetchPurchasesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createPurchaseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPurchaseSuccess: (state, action) => {
      state.loading = false;
      state.purchases.unshift(action.payload);
      state.error = null;
    },
    createPurchaseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePurchaseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePurchaseSuccess: (state, action) => {
      state.loading = false;
      const index = state.purchases.findIndex(purchase => purchase._id === action.payload._id);
      if (index !== -1) {
        state.purchases[index] = action.payload;
      }
      state.error = null;
    },
    updatePurchaseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePurchaseStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deletePurchaseSuccess: (state, action) => {
      state.loading = false;
      state.purchases = state.purchases.filter(purchase => purchase._id !== action.payload);
      state.error = null;
    },
    deletePurchaseFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPurchase: (state, action) => {
      state.currentPurchase = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create purchase return
      .addCase(createPurchaseReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createPurchaseReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchPurchasesStart,
  fetchPurchasesSuccess,
  fetchPurchasesFailure,
  createPurchaseStart,
  createPurchaseSuccess,
  createPurchaseFailure,
  updatePurchaseStart,
  updatePurchaseSuccess,
  updatePurchaseFailure,
  deletePurchaseStart,
  deletePurchaseSuccess,
  deletePurchaseFailure,
  setCurrentPurchase,
  clearError,
} = purchasesSlice.actions;

// Selectors
export const selectPurchases = (state) => state.purchases.purchases;
export const selectPurchasesLoading = (state) => state.purchases.loading;
export const selectPurchasesError = (state) => state.purchases.error;

export default purchasesSlice.reducer;