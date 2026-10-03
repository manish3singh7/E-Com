import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

const thunk = (name, fn) => createAsyncThunk(name, async (arg, { rejectWithValue }) => { try { return await fn(arg); } catch (e) { return rejectWithValue(e.message); } });

// authSlice
export const fetchMe = thunk('auth/me', () => api('/auth/me'));
export const login = thunk('auth/login', (b) => api('/auth/login', { method: 'POST', body: b }));
export const register = thunk('auth/register', (b) => api('/auth/register', { method: 'POST', body: b }));
export const logout = thunk('auth/logout', () => api('/auth/logout', { method: 'POST' }));
const authSlice = createSlice({
  name: 'auth', initialState: { user: null, ready: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.ready = true; })
      .addCase(fetchMe.rejected, (s) => { s.ready = true; })
      .addCase(logout.fulfilled, (s) => { s.user = null; });
    for (const t of [login, register]) b.addCase(t.fulfilled, (s, a) => { s.user = a.payload; s.error = null; }).addCase(t.rejected, (s, a) => { s.error = a.payload; });
  },
});

// cartSlice (kept in localStorage; the server re-prices everything at checkout)
const saved = (() => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } })();
const cartSlice = createSlice({
  name: 'cart', initialState: { items: saved },
  reducers: {
    add: (s, { payload: p }) => { const l = s.items.find((i) => i._id === p._id); if (l) l.qty = Math.min(l.qty + 1, p.stock); else s.items.push({ _id: p._id, name: p.name, image: p.images?.[0], price: p.discountPrice || p.price, stock: p.stock, qty: 1 }); },
    setQty: (s, { payload: { id, qty } }) => { const l = s.items.find((i) => i._id === id); if (l) l.qty = Math.max(1, Math.min(qty, l.stock)); },
    remove: (s, { payload }) => { s.items = s.items.filter((i) => i._id !== payload); },
    clear: (s) => { s.items = []; },
  },
});

// productSlice
export const fetchProducts = thunk('products/list', (qs = '') => api('/products?' + qs));
const productSlice = createSlice({
  name: 'products', initialState: { items: [], total: 0, pages: 1, loading: false, error: null },
  extraReducers: (b) => b
    .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
    .addCase(fetchProducts.fulfilled, (s, a) => { Object.assign(s, a.payload, { loading: false }); })
    .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; }),
});

// wishlistSlice (synced to the server when logged in)
export const toggleWish = thunk('wish/toggle', (id) => api('/wishlist/' + id, { method: 'POST' }));
export const fetchWish = thunk('wish/get', () => api('/wishlist'));
const wishlistSlice = createSlice({
  name: 'wishlist', initialState: { ids: [] },
  extraReducers: (b) => b.addCase(toggleWish.fulfilled, (s, a) => { s.ids = a.payload; }).addCase(fetchWish.fulfilled, (s, a) => { s.ids = a.payload; }),
});

// orderSlice
export const fetchOrders = thunk('orders/mine', () => api('/orders'));
const orderSlice = createSlice({
  name: 'orders', initialState: { items: [], loading: false },
  extraReducers: (b) => b.addCase(fetchOrders.pending, (s) => { s.loading = true; }).addCase(fetchOrders.fulfilled, (s, a) => { s.items = a.payload; s.loading = false; }).addCase(fetchOrders.rejected, (s) => { s.loading = false; }),
});

export const { clearError } = authSlice.actions;
export const cartActions = cartSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer, cart: cartSlice.reducer, products: productSlice.reducer, wishlist: wishlistSlice.reducer, orders: orderSlice.reducer } });
store.subscribe(() => localStorage.setItem('cart', JSON.stringify(store.getState().cart.items)));
