import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.customer) queryParams.append('customer', params.customer);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params.deliveryStatus) queryParams.append('deliveryStatus', params.deliveryStatus);
    if (params.company) queryParams.append('company', params.company);
    if (params.type) queryParams.append('type', params.type);
    
    const response = await fetch(`/api/sales?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales');
    }
    return response.json();
  }
);

export const fetchCustomersForSales = createAsyncThunk(
  'sales/fetchCustomersForSales',
  async () => {
    const response = await fetch('/api/customers');
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    const data = await response.json();
    return data.customers || [];
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData) => {
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sale');
    }
    return response.json();
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, data }) => {
    const response = await fetch(`/api/sales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update sale');
    }
    return response.json();
  }
);

export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id) => {
    const response = await fetch(`/api/sales/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete sale');
    }
    return id;
  }
);

export const fetchSaleById = createAsyncThunk(
  'sales/fetchSaleById',
  async (id) => {
    const response = await fetch(`/api/sales/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sale');
    }
    return response.json();
  }
);

export const fetchSaleReturns = createAsyncThunk(
  'sales/fetchSaleReturns',
  async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.saleId) queryParams.append('saleId', params.saleId);
    
    const response = await fetch(`/api/sales/returns?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sale returns');
    }
    return response.json();
  }
);

const initialState = {
  sales: [],
  currentSale: null,
  customers: [],
  customersLoading: false,
  customersError: null,
  returns: [],
  returnsLoading: false,
  returnsError: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  filters: {
    customer: '',
    customerId: '',
    company: '',
    dateFrom: '',
    dateTo: '',
    paymentStatus: '',
    deliveryStatus: '',
    type: 'Sale',
  },
  pagination: {
    page: 1,
    totalPages: 0,
    total: 0,
  },
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
    },
    setFilterField: (state, action) => {
      const { field, value } = action.payload;
      state.filters[field] = value;
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        customer: '',
        customerId: '',
        company: '',
        dateFrom: '',
        dateTo: '',
        paymentStatus: '',
        deliveryStatus: '',
        type: 'Sale',
      };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
      state.customersError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sales
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.sales;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
        state.error = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch customers for sales
    builder
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
        state.customersError = action.error.message;
      });

    // Create sale
    builder
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh the sales list after creating
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Update sale
    builder
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale._id === action.payload.sale._id);
        if (index !== -1) {
          state.sales[index] = action.payload.sale;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Delete sale
    builder
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter(sale => sale._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch sale by ID
    builder
      .addCase(fetchSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload.sale;
        state.error = null;
      })
      .addCase(fetchSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch sale returns
    builder
      .addCase(fetchSaleReturns.pending, (state) => {
        state.returnsLoading = true;
        state.returnsError = null;
      })
      .addCase(fetchSaleReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.returns = action.payload.returns || [];
        state.returnsError = null;
      })
      .addCase(fetchSaleReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.returnsError = action.error.message;
      });
  },
});

// Selectors
export const selectSales = (state) => state.sales.sales;
export const selectSalesLoading = (state) => state.sales.loading;
export const selectSalesError = (state) => state.sales.error;
export const selectSalesPagination = (state) => state.sales.pagination;
export const selectSalesFilters = (state) => state.sales.filters;
export const selectSalesCustomers = (state) => state.sales.customers;
export const selectCustomersLoading = (state) => state.sales.customersLoading;
export const selectCurrentSale = (state) => state.sales.currentSale;
export const selectSaleReturns = (state) => state.sales.returns;
export const selectReturnsLoading = (state) => state.sales.returnsLoading;
export const selectReturnsError = (state) => state.sales.returnsError;

export const {
  setCurrentSale,
  setFilterField,
  setCurrentPage,
  clearFilters,
  clearError,
} = salesSlice.actions;

export default salesSlice.reducer;