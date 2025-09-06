import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api";

// Async thunks
export const fetchPurchases = createAsyncThunk(
  "purchases/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getPurchases();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPurchaseById = createAsyncThunk(
  "purchases/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.getPurchase(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPurchase = createAsyncThunk(
  "purchases/create",
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createPurchase(purchaseData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePurchase = createAsyncThunk(
  "purchases/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updatePurchase(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePurchase = createAsyncThunk(
  "purchases/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.deletePurchase(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPurchaseReturn = createAsyncThunk(
  "purchases/createReturn",
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create purchase return');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  purchases: [],
  currentPurchase: null,
  loading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  lastFetched: null,
};

const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload.purchases || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Purchase by ID
      .addCase(fetchPurchaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload;
        state.error = null;
      })
      .addCase(fetchPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload.purchase);
        state.total += 1;
        state.error = null;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Purchase
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(
          (purchase) => purchase._id === action.payload.purchase._id
        );
        if (index !== -1) {
          state.purchases[index] = action.payload.purchase;
        }
        if (
          state.currentPurchase &&
          state.currentPurchase._id === action.payload.purchase._id
        ) {
          state.currentPurchase = action.payload.purchase;
        }
        state.error = null;
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Purchase
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(
          (purchase) => purchase._id !== action.payload.id
        );
        state.total -= 1;
        if (
          state.currentPurchase &&
          state.currentPurchase._id === action.payload.id
        ) {
          state.currentPurchase = null;
        }
        state.error = null;
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Purchase Return
      .addCase(createPurchaseReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload.purchase);
        state.total += 1;
        state.error = null;
      })
      .addCase(createPurchaseReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPurchase, setCurrentPage } =
  purchasesSlice.actions;

// Selectors
export const selectPurchases = (state) => state.purchases.purchases;
export const selectCurrentPurchase = (state) => state.purchases.currentPurchase;
export const selectPurchasesLoading = (state) => state.purchases.loading;
export const selectPurchasesError = (state) => state.purchases.error;
export const selectPurchasesTotal = (state) => state.purchases.total;
export const selectPurchasesTotalPages = (state) => state.purchases.totalPages;
export const selectPurchasesCurrentPage = (state) => state.purchases.currentPage;

export default purchasesSlice.reducer;
