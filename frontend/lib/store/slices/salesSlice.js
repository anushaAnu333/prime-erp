import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api";

// Async thunks
export const fetchSales = createAsyncThunk(
  "sales/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 20).toString(),
        type: params.type || "Sale",
        ...(params.customer && { customer: params.customer }),
        ...(params.customerId && { customerId: params.customerId }),
        ...(params.company && { company: params.company }),
        ...(params.dateFrom && { dateFrom: params.dateFrom }),
        ...(params.dateTo && { dateTo: params.dateTo }),
        ...(params.paymentStatus && { paymentStatus: params.paymentStatus }),
        ...(params.deliveryStatus && { deliveryStatus: params.deliveryStatus }),
      });

      const response = await fetch(`/api/sales?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sales');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomersForSales = createAsyncThunk(
  "sales/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch customers');
      }
      const data = await response.json();
      return data.customers || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSaleById = createAsyncThunk(
  "sales/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/sales/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sale');
      }
      
      const data = await response.json();
      return data.sale;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSale = createAsyncThunk(
  "sales/create",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sale');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSale = createAsyncThunk(
  "sales/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update sale');
      }
      
      return await response.json();
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

export const createSalesReturn = createAsyncThunk(
  "sales/createReturn",
  async (returnData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/sales/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sales return');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSaleReturns = createAsyncThunk(
  "sales/fetchReturns",
  async (saleId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/sales?type=Sale Return&originalSaleId=${saleId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch sale returns');
      }
      
      const data = await response.json();
      return data.sales || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sales: [],
  currentSale: null,
  saleReturns: [],
  customers: [],
  loading: false,
  customersLoading: false,
  returnsLoading: false,
  error: null,
  customersError: null,
  returnsError: null,
  pagination: {
    page: 1,
    total: 0,
    totalPages: 0,
  },
  filters: {
    customer: "",
    company: "",
    dateFrom: "",
    dateTo: "",
    paymentStatus: "",
    deliveryStatus: "",
    type: "Sale",
  },
  lastFetched: null,
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.customersError = null;
      state.returnsError = null;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.page = 1;
    },
    setFilterField: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
      // Reset to page 1 when filters change
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        customer: "",
        company: "",
        dateFrom: "",
        dateTo: "",
        paymentStatus: "",
        deliveryStatus: "",
        type: "Sale",
      };
      state.pagination.page = 1;
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
        state.sales = action.payload.sales || [];
        state.pagination = {
          page: state.pagination.page,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
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
        state.currentSale = null;
      })
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload.sale);
        state.pagination.total += 1;
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
        const updatedSale = action.payload.sale || action.payload;
        const index = state.sales.findIndex(
          (sale) => sale._id === updatedSale._id
        );
        if (index !== -1) {
          state.sales[index] = updatedSale;
        }
        if (
          state.currentSale &&
          state.currentSale._id === updatedSale._id
        ) {
          state.currentSale = updatedSale;
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
        state.pagination.total -= 1;
        if (state.currentSale && state.currentSale._id === action.payload.id) {
          state.currentSale = null;
        }
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch customers for sales
      .addCase(fetchCustomersForSales.pending, (state) => {
        state.customersLoading = true;
        state.customersError = null;
      })
      .addCase(fetchCustomersForSales.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customers = action.payload;
        state.customersError = null;
      })
      .addCase(fetchCustomersForSales.rejected, (state, action) => {
        state.customersLoading = false;
        state.customersError = action.payload;
      })
      
      // Create Sales Return
      .addCase(createSalesReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSalesReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload.sale);
        state.pagination.total += 1;
        state.error = null;
      })
      .addCase(createSalesReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch sale returns
      .addCase(fetchSaleReturns.pending, (state) => {
        state.returnsLoading = true;
        state.returnsError = null;
      })
      .addCase(fetchSaleReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.saleReturns = action.payload;
        state.returnsError = null;
      })
      .addCase(fetchSaleReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.returnsError = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentSale, 
  setCurrentPage, 
  setFilters, 
  setFilterField, 
  resetFilters 
} = salesSlice.actions;

// Selectors
export const selectSales = (state) => state.sales.sales;
export const selectCurrentSale = (state) => state.sales.currentSale;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectSalesPagination = (state) => state.sales.pagination;
export const selectSalesFilters = (state) => state.sales.filters;
export const selectSalesCustomers = (state) => state.sales.customers;
export const selectCustomersLoading = (state) => state.sales.customersLoading;
export const selectCustomersError = (state) => state.sales.customersError;
export const selectSaleReturns = (state) => state.sales.saleReturns;
export const selectReturnsLoading = (state) => state.sales.returnsLoading;
export const selectReturnsError = (state) => state.sales.returnsError;
export default salesSlice.reducer;
