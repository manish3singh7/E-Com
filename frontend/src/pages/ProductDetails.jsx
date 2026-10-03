import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, rupees } from '../api';
import { cartActions } from '../store';
export default function ProductDetails() {
  const { id } = useParams(); const d = useDispatch(); const user = useSelector((s) => s.auth.user);
  const [p, setP] = useState(null); const [err, setErr] = useState(''); const [rv, setRv] = useState({ rating: 5, comment: '' }); const [related, setRelated] = useState([]);
  const load = () => api('/products/' + id).then(setP).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (p) api(`/products?category=${p.category}&limit=5`).then((r) => setRelated(r.items.filter((x) => x._id !== p._id).slice(0, 4))); }, [p?._id]);
  if (err) return <p role="alert">{err}</p>; if (!p) return <p>Loading…</p>;
  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={p.images?.[0]} alt={p.name} className="w-full rounded-lg" />
        <div className="space-y-3"><h1 className="text-3xl font-extrabold">{p.name}</h1><p className="text-muted">{p.brand} · {p.rating ? p.rating.toFixed(1) + ' ★' : 'No reviews yet'}</p>
          <p className="text-2xl font-bold">{rupees(p.discountPrice || p.price)} {p.discountPrice && <s className="text-base font-normal text-muted">{rupees(p.price)}</s>}</p>
          <p>{p.description}</p><p className="text-sm">{p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}</p>
          <button className="btn" disabled={!p.stock} onClick={() => d(cartActions.add(p))}>Add to cart</button></div>
      </div>
      <section><h2 className="mb-2 text-xl font-bold">Reviews</h2>
        {p.reviews.length === 0 && <p>No reviews yet.</p>}
        {p.reviews.map((r) => <p key={r._id} className="border-b border-line py-2"><b>{r.name}</b> · {r.rating}★<br />{r.comment}</p>)}
        {user && <form className="mt-4 max-w-md space-y-2" onSubmit={async (e) => { e.preventDefault(); try { setP(await api(`/products/${id}/reviews`, { method: 'POST', body: rv })); } catch (x) { alert(x.message); } }}>
          <select className="field" value={rv.rating} onChange={(e) => setRv({ ...rv, rating: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select>
          <textarea className="field" placeholder="What did you think?" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} /><button className="btn">Post review</button></form>}
      </section>
      {related.length > 0 && <section><h2 className="mb-2 text-xl font-bold">You may also like</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((x) => <a key={x._id} href={`/products/${x._id}`} className="block rounded-lg border border-line bg-white p-2"><img src={x.images?.[0]} alt="" className="aspect-square w-full rounded object-cover" /><p className="mt-1 font-semibold">{x.name}</p></a>)}</div></section>}
    </div>
  );
}
