import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/cart');
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cart/add', payload);
      return data.cart;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add to cart'
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/item/${itemId}`);
      return data.cart;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    isOpen: false,
    error: null,
  },
  reducers: {
    toggleCart(state) { state.isOpen = !state.isOpen; },
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
    clearCartState(state) { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload?.items || [];
      })
      .addCase(addToCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.items = payload?.items || [];
      });
  },
});

export const {
  toggleCart,
  openCart,
  closeCart,
  clearCartState,
} = cartSlice.actions;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.quantity || 0), 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0
  );

export default cartSlice.reducer;