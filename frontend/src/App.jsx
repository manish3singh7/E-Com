import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, fetchWish } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { Login, Register } from './pages/Auth';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

function Protected({ admin }) {
  const { user, ready } = useSelector((s) => s.auth);
  if (!ready) return <p className="p-8">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
export default function App() {
  const d = useDispatch(); const user = useSelector((s) => s.auth.user);
  useEffect(() => { d(fetchMe()); }, [d]);
  useEffect(() => { if (user) d(fetchWish()); }, [user, d]);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Protected />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
          <Route element={<Protected admin />}><Route path="/admin" element={<Admin />} /></Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
