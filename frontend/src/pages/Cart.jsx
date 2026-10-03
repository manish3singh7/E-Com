import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions } from '../store';
import { rupees } from '../api';
export const totals = (items, pct = 0) => { const sub = items.reduce((a, i) => a + i.price * i.qty, 0); const disc = Math.round(sub * pct / 100); const ship = sub === 0 || sub >= 999 ? 0 : 79; const tax = Math.round((sub - disc) * 0.05); return { sub, disc, ship, tax, total: sub - disc + ship + tax }; };
export default function Cart() {
  const items = useSelector((s) => s.cart.items); const d = useDispatch(); const t = totals(items);
  if (!items.length) return <p>Your cart is empty. <Link className="underline" to="/products">Find something to love</Link>.</p>;
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_280px]">
      <ul className="space-y-3">{items.map((i) => (
        <li key={i._id} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3">
          <img src={i.image} alt="" className="h-16 w-16 rounded object-cover" /><div className="flex-1"><p className="font-semibold">{i.name}</p><p className="text-sm text-muted">{rupees(i.price)}</p></div>
          <div className="flex items-center gap-2"><button className="btn-alt" aria-label="Decrease" onClick={() => d(cartActions.setQty({ id: i._id, qty: i.qty - 1 }))}>−</button><span>{i.qty}</span><button className="btn-alt" aria-label="Increase" onClick={() => d(cartActions.setQty({ id: i._id, qty: i.qty + 1 }))}>+</button></div>
          <button className="underline" onClick={() => d(cartActions.remove(i._id))}>Remove</button></li>))}
        <li><button className="underline" onClick={() => d(cartActions.clear())}>Clear cart</button></li></ul>
      <aside className="h-fit space-y-1 rounded-lg border border-line bg-white p-4">
        <p className="flex justify-between"><span>Items</span>{rupees(t.sub)}</p><p className="flex justify-between"><span>Shipping</span>{t.ship ? rupees(t.ship) : 'Free'}</p><p className="flex justify-between"><span>GST (5%)</span>{rupees(t.tax)}</p>
        <p className="flex justify-between border-t border-line pt-2 text-lg font-bold"><span>Total</span>{rupees(t.total)}</p><Link to="/checkout" className="btn mt-3 w-full">Checkout</Link></aside>
    </div>
  );
}
