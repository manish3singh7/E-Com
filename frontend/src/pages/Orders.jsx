import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store';
import { rupees } from '../api';
const STEPS = ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export default function Orders() {
  const d = useDispatch(); const { items, loading } = useSelector((s) => s.orders);
  useEffect(() => { d(fetchOrders()); }, [d]);
  if (loading) return <p>Loading…</p>; if (!items.length) return <p>No orders yet.</p>;
  return (<div className="space-y-4"><h1 className="text-2xl font-extrabold">My orders</h1>{items.map((o) => (
    <article key={o._id} className="rounded-lg border border-line bg-white p-4">
      <p className="flex justify-between font-semibold"><span>{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.paymentStatus === 'PAID' ? 'Paid' : 'Payment ' + o.paymentStatus.toLowerCase()}</span><span>{rupees(o.totalAmount)}</span></p>
      <p className="text-sm text-muted">{o.products.map((p) => `${p.name} × ${p.qty}`).join(', ')}</p>
      <ol className="mt-3 flex gap-1 text-xs">{STEPS.map((s, i) => <li key={s} className={`flex-1 rounded p-1 text-center ${i <= STEPS.indexOf(o.orderStatus) ? 'bg-ink text-white' : 'bg-paper text-muted'}`}>{s.replaceAll('_', ' ').toLowerCase()}</li>)}</ol></article>))}</div>);
}
