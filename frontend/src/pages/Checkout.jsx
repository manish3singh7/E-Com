import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, rupees } from '../api';
import { cartActions } from '../store';
import { totals } from './Cart';
export default function Checkout() {
  const items = useSelector((s) => s.cart.items); const user = useSelector((s) => s.auth.user); const d = useDispatch(); const nav = useNavigate();
  const [a, setA] = useState({ line1: '', city: '', state: '', pincode: '', phone: '', ...(user.address || {}) });
  const [coupon, setCoupon] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const t = totals(items, coupon.toUpperCase() === 'WELCOME10' ? 10 : coupon.toUpperCase() === 'SAVE20' ? 20 : 0);
  if (!items.length) return <p>Your cart is empty. <Link className="underline" to="/products">Browse the shop</Link>.</p>;
  const pay = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      // Cart -> Address -> Order (server prices it) -> Razorpay -> server verifies -> confirmation
      const { razorpayOrder, key } = await api('/orders', { method: 'POST', body: { items: items.map((i) => ({ productId: i._id, qty: i.qty })), shippingAddress: a, coupon } });
      new window.Razorpay({ key, amount: razorpayOrder.amount, currency: 'INR', order_id: razorpayOrder.id, name: 'Kaarigar', prefill: { name: user.name, email: user.email, contact: a.phone },
        handler: async (r) => { try { await api('/payments/verify', { method: 'POST', body: r }); d(cartActions.clear()); nav('/orders'); } catch (x) { setErr(x.message); } },
        modal: { ondismiss: () => setBusy(false) } }).open();
    } catch (x) { setErr(x.message); setBusy(false); }
  };
  const on = (k) => (e) => setA({ ...a, [k]: e.target.value });
  return (
    <form onSubmit={pay} className="grid gap-8 md:grid-cols-[1fr_280px]">
      <div className="space-y-3"><h1 className="text-2xl font-extrabold">Delivery address</h1>
        <input className="field" placeholder="Address" value={a.line1} onChange={on('line1')} required />
        <div className="grid grid-cols-2 gap-3"><input className="field" placeholder="City" value={a.city} onChange={on('city')} required /><input className="field" placeholder="State" value={a.state} onChange={on('state')} required />
          <input className="field" placeholder="PIN code" pattern="[0-9]{6}" value={a.pincode} onChange={on('pincode')} required /><input className="field" placeholder="Phone" pattern="[0-9]{10}" value={a.phone} onChange={on('phone')} required /></div>
        <input className="field" placeholder="Coupon code (try WELCOME10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />{err && <p role="alert" className="text-red-700">{err}</p>}</div>
      <aside className="h-fit space-y-1 rounded-lg border border-line bg-white p-4"><p className="flex justify-between"><span>Items</span>{rupees(t.sub)}</p>{t.disc > 0 && <p className="flex justify-between"><span>Coupon</span>−{rupees(t.disc)}</p>}
        <p className="flex justify-between"><span>Shipping</span>{t.ship ? rupees(t.ship) : 'Free'}</p><p className="flex justify-between"><span>GST (5%)</span>{rupees(t.tax)}</p>
        <p className="flex justify-between border-t border-line pt-2 text-lg font-bold"><span>Total</span>{rupees(t.total)}</p><button className="btn mt-3 w-full" disabled={busy}>{busy ? 'Opening payment…' : `Pay ${rupees(t.total)}`}</button></aside>
    </form>
  );
}
