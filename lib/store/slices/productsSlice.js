import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  currentProduct: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
  // Optimistic update states
  optimisticUpdates: {
    creating: false,
    updating: {},
    deleting: {},
  },
  // Cache management
  lastFetch: null,
  cacheKey: null,
};

// Helper function to generate cache key
const generateCacheKey = (params) => {
  return `products_${params.page || 1}_${params.limit || 20}_${params.search || ''}`;
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const cacheKey = generateCacheKey(params);
      
      // Check if we have recent cached data (within 30 seconds)
      if (state.products.cacheKey === cacheKey && 
          state.products.lastFetch && 
          Date.now() - state.products.lastFetch < 30000) {
        return {
          products: state.products.products,
          total: state.products.total,
          totalPages: state.products.totalPages,
          currentPage: state.products.currentPage,
          fromCache: true
        };
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      return { ...data, cacheKey };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Invalidate cache after successful deletion
      dispatch(invalidateCache());
      
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      const result = await response.json();
      
      // Invalidate cache after successful creation
      dispatch(invalidateCache());
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      const result = await response.json();
      
      // Invalidate cache after successful update
      dispatch(invalidateCache());
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Optimistic updates
    optimisticCreateProduct: (state, action) => {
      const tempProduct = {
        ...action.payload,
        _id: `temp_${Date.now()}`,
        isOptimistic: true,
      };
      state.products.unshift(tempProduct);
      state.optimisticUpdates.creating = true;
    },
    optimisticUpdateProduct: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.products.findIndex(product => product._id === id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updates, isOptimistic: true };
        state.optimisticUpdates.updating[id] = true;
      }
    },
    optimisticDeleteProduct: (state, action) => {
      const productId = action.payload;
      const index = state.products.findIndex(product => product._id === productId);
      if (index !== -1) {
        state.products[index].isOptimistic = true;
        state.optimisticUpdates.deleting[productId] = true;
      }
    },
    revertOptimisticUpdate: (state, action) => {
      const { type, productId, originalData } = action.payload;
      
      switch (type) {
        case 'create':
          state.products = state.products.filter(p => p._id !== productId);
          state.optimisticUpdates.creating = false;
          break;
        case 'update':
          const updateIndex = state.products.findIndex(p => p._id === productId);
          if (updateIndex !== -1) {
            state.products[updateIndex] = { ...originalData, isOptimistic: false };
          }
          delete state.optimisticUpdates.updating[productId];
          break;
        case 'delete':
          const deleteIndex = state.products.findIndex(p => p._id === productId);
          if (deleteIndex !== -1) {
            state.products[deleteIndex].isOptimistic = false;
          }
          delete state.optimisticUpdates.deleting[productId];
          break;
      }
    },
    // Cache management
    invalidateCache: (state) => {
      state.cacheKey = null;
      state.lastFetch = null;
    },
    // Legacy reducers (kept for compatibility)
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.error = null;
        state.lastFetch = Date.now();
        state.cacheKey = action.payload.cacheKey;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product._id !== action.payload);
        state.error = null;
        delete state.optimisticUpdates.deleting[action.payload];
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove optimistic product and add real one
        state.products = state.products.filter(p => !p.isOptimistic);
        state.products.unshift(action.payload.product);
        state.error = null;
        state.optimisticUpdates.creating = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(product => product._id === action.payload.product._id);
        if (index !== -1) {
          state.products[index] = { ...action.payload.product, isOptimistic: false };
        }
        state.error = null;
        delete state.optimisticUpdates.updating[action.payload.product._id];
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  optimisticCreateProduct,
  optimisticUpdateProduct,
  optimisticDeleteProduct,
  revertOptimisticUpdate,
  invalidateCache,
  setCurrentProduct,
  clearCurrentProduct,
  clearError,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => ({
  total: state.products.total,
  totalPages: state.products.totalPages,
  currentPage: state.products.currentPage,
});
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectOptimisticUpdates = (state) => state.products.optimisticUpdates;
export const selectCacheInfo = (state) => ({
  lastFetch: state.products.lastFetch,
  cacheKey: state.products.cacheKey,
});

export default productsSlice.reducer;