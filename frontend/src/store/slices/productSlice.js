import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/products?${query}`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${slug}`);
      return data.product;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Product not found'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/categories');
      return data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    currentProduct: null,
    loading: false,
    error: null,
    total: 0,
    pages: 1,
  },
  reducers: {
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.products || [];
        state.total = payload.total || 0;
        state.pages = payload.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.items = [];
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentProduct = payload;
      })
      .addCase(fetchProductBySlug.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.categories = payload || [];
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;