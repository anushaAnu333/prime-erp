import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vendors: [],
  currentVendor: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    fetchVendorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVendorsSuccess: (state, action) => {
      state.loading = false;
      state.vendors = action.payload.vendors;
      state.total = action.payload.total;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.error = null;
    },
    fetchVendorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createVendorSuccess: (state, action) => {
      state.loading = false;
      state.vendors.unshift(action.payload);
      state.error = null;
    },
    createVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVendorSuccess: (state, action) => {
      state.loading = false;
      const index = state.vendors.findIndex(vendor => vendor._id === action.payload._id);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
      state.error = null;
    },
    updateVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteVendorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVendorSuccess: (state, action) => {
      state.loading = false;
      state.vendors = state.vendors.filter(vendor => vendor._id !== action.payload);
      state.error = null;
    },
    deleteVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentVendor: (state, action) => {
      state.currentVendor = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchVendorsStart,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  createVendorStart,
  createVendorSuccess,
  createVendorFailure,
  updateVendorStart,
  updateVendorSuccess,
  updateVendorFailure,
  deleteVendorStart,
  deleteVendorSuccess,
  deleteVendorFailure,
  setCurrentVendor,
  clearError,
} = vendorsSlice.actions;
export default vendorsSlice.reducer;