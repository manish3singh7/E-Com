import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store';
import ProductCard from '../components/ProductCard';
export default function Products() {
  const [sp, setSp] = useSearchParams(); const d = useDispatch(); const { items, loading, error, pages } = useSelector((s) => s.products);
  const qs = sp.toString();
  useEffect(() => { d(fetchProducts(qs)); }, [qs, d]);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); n.delete('page'); setSp(n); };
  const page = Number(sp.get('page') || 1);
  const sel = (k, label, opts) => (<label className="block text-sm font-semibold">{label}<select className="field mt-1 font-normal" value={sp.get(k) || ''} onChange={(e) => set(k, e.target.value)}><option value="">Any</option>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>);
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="space-y-3">
        <label className="block text-sm font-semibold">Search<input className="field mt-1 font-normal" defaultValue={sp.get('q') || ''} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} placeholder="Press Enter" /></label>
        {sel('category', 'Category', ['Textiles', 'Home', 'Kitchen', 'Stationery'].map((c) => [c, c]))}
        {sel('brand', 'Brand', ['Jaipur Loom', 'Khurja Kiln', 'Moradabad Metals', 'Sanganer Press', 'Bengal Thread', 'Saharanpur Wood'].map((c) => [c, c]))}
        {sel('maxPrice', 'Price up to', [[500, '₹500'], [1000, '₹1,000'], [2000, '₹2,000']])}
        {sel('rating', 'Rating', [[4, '4★ & up'], [3, '3★ & up']])}
        {sel('sort', 'Sort by', [['newest', 'Newest'], ['popular', 'Most popular'], ['rating', 'Top rated'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low']])}
      </aside>
      <section>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {loading ? <p>Loading…</p> : items.length === 0 ? <p>No products match those filters. Try removing one.</p> :
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>}
        {pages > 1 && <div className="mt-6 flex gap-2">{Array.from({ length: pages }, (_, i) => <button key={i} className={i + 1 === page ? 'btn' : 'btn-alt'} onClick={() => { const n = new URLSearchParams(sp); n.set('page', i + 1); setSp(n); }}>{i + 1}</button>)}</div>}
      </section>
    </div>
  );
}
