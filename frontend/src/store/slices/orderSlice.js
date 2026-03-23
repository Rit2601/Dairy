import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/orders', orderData);
      return data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to place order'
      );
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/mine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders/mine');
      return data.orders;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/byId',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderError(state) { state.error = null; },
    clearCurrentOrder(state) { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentOrder = payload;
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.items = payload || [];
      })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
        state.currentOrder = payload;
      });
  },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;