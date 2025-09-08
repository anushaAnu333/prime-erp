import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create customer');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  customers: [],
  currentCustomer: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    fetchCustomersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCustomersSuccess: (state, action) => {
      state.loading = false;
      state.customers = action.payload.customers;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.error = null;
    },
    fetchCustomersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCustomerSuccess: (state, action) => {
      state.loading = false;
      state.customers.unshift(action.payload);
      state.error = null;
    },
    createCustomerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCustomerSuccess: (state, action) => {
      state.loading = false;
      const index = state.customers.findIndex(customer => customer._id === action.payload._id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      state.error = null;
    },
    updateCustomerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCustomerSuccess: (state, action) => {
      state.loading = false;
      state.customers = state.customers.filter(customer => customer._id !== action.payload);
      state.error = null;
    },
    deleteCustomerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload.customer);
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  createCustomerStart,
  createCustomerSuccess,
  createCustomerFailure,
  updateCustomerStart,
  updateCustomerSuccess,
  updateCustomerFailure,
  deleteCustomerStart,
  deleteCustomerSuccess,
  deleteCustomerFailure,
  setCurrentCustomer,
  clearError,
} = customersSlice.actions;
export default customersSlice.reducer;