import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions, toggleWish } from '../store';
import { rupees } from '../api';
export default function ProductCard({ p }) {
  const d = useDispatch(); const user = useSelector((s) => s.auth.user); const wished = useSelector((s) => s.wishlist.ids.includes(p._id));
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
      <Link to={`/products/${p._id}`}><img src={p.images?.[0]} alt={p.name} loading="lazy" className="aspect-square w-full object-cover" /></Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/products/${p._id}`} className="font-semibold hover:underline">{p.name}</Link>
        <p className="text-sm text-muted">{p.brand} · {p.rating ? p.rating.toFixed(1) + ' ★' : 'No reviews yet'}</p>
        <p className="mt-auto"><span className="font-bold">{rupees(p.discountPrice || p.price)}</span>{p.discountPrice && <s className="ml-2 text-sm text-muted">{rupees(p.price)}</s>}</p>
        <div className="mt-2 flex gap-2">
          <button className="btn flex-1" disabled={!p.stock} onClick={() => d(cartActions.add(p))}>{p.stock ? 'Add to cart' : 'Sold out'}</button>
          {user && <button className="btn-alt" aria-pressed={wished} aria-label="Save to wishlist" onClick={() => d(toggleWish(p._id))}>{wished ? '♥' : '♡'}</button>}
        </div>
      </div>
    </article>
  );
}
