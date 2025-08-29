import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api";

// Async thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCustomers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCustomer(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await apiClient.createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateCustomer(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.deleteCustomer(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  lastFetched: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers || action.payload;
        state.total = action.payload.total || action.payload.length;
        state.totalPages = action.payload.totalPages || 1;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.customer);
        state.total += 1;
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Customer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(
          (customer) => customer._id === action.payload.customer._id
        );
        if (index !== -1) {
          state.customers[index] = action.payload.customer;
        }
        if (
          state.currentCustomer &&
          state.currentCustomer._id === action.payload.customer._id
        ) {
          state.currentCustomer = action.payload.customer;
        }
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload.id
        );
        state.total -= 1;
        if (
          state.currentCustomer &&
          state.currentCustomer._id === action.payload.id
        ) {
          state.currentCustomer = null;
        }
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCustomer, setCurrentPage } =
  customersSlice.actions;
export default customersSlice.reducer;
