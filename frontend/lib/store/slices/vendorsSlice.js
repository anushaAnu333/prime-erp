import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api";

// Async thunks
export const fetchVendors = createAsyncThunk(
  "vendors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getVendors();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchVendorById = createAsyncThunk(
  "vendors/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.getVendor(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVendor = createAsyncThunk(
  "vendors/create",
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createVendor(vendorData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateVendor(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVendor = createAsyncThunk(
  "vendors/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.deleteVendor(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  vendors: [],
  currentVendor: null,
  loading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  lastFetched: null,
};

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.vendors || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor by ID
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
        state.error = null;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Vendor
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.unshift(action.payload.vendor);
        state.total += 1;
        state.error = null;
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Vendor
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(
          (vendor) => vendor._id === action.payload.vendor._id
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.vendor;
        }
        if (
          state.currentVendor &&
          state.currentVendor._id === action.payload.vendor._id
        ) {
          state.currentVendor = action.payload.vendor;
        }
        state.error = null;
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Vendor
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter(
          (vendor) => vendor._id !== action.payload.id
        );
        state.total -= 1;
        if (
          state.currentVendor &&
          state.currentVendor._id === action.payload.id
        ) {
          state.currentVendor = null;
        }
        state.error = null;
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentVendor, setCurrentPage } =
  vendorsSlice.actions;
export default vendorsSlice.reducer;
