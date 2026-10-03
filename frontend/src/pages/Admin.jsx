import { useEffect, useState } from 'react';
import { api, rupees, BASE } from '../api';
const STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const blank = { name: '', price: '', discountPrice: '', category: 'Home', brand: '', stock: 10, description: '', images: [] };
export default function Admin() {
  const [tab, setTab] = useState('overview'); const [stats, setStats] = useState(null); const [products, setProducts] = useState([]); const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]); const [coupons, setCoupons] = useState([]); const [f, setF] = useState(blank); const [cp, setCp] = useState({ code: '', percent: 10 }); const [msg, setMsg] = useState('');
  const load = () => { api('/admin/stats').then(setStats); api('/products?limit=48').then((r) => setProducts(r.items)); api('/orders/admin/all').then(setOrders); api('/admin/users').then(setUsers); api('/admin/coupons').then(setCoupons); };
  useEffect(load, []);
  const run = async (fn) => { setMsg(''); try { await fn(); load(); } catch (e) { setMsg(e.message); } };
  const upload = (file) => run(async () => { const fd = new FormData(); fd.append('image', file); const r = await fetch(BASE + '/upload', { method: 'POST', credentials: 'include', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.message); setF((x) => ({ ...x, images: [j.url] })); });
  const max = Math.max(1, ...(stats?.daily || []).map((x) => x.total));
  return (
    <div className="space-y-5"><h1 className="text-2xl font-extrabold">Admin</h1>
      <div className="flex flex-wrap gap-2">{['overview', 'products', 'orders', 'customers', 'coupons'].map((t) => <button key={t} className={tab === t ? 'btn' : 'btn-alt'} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {msg && <p role="alert" className="text-red-700">{msg}</p>}
      {tab === 'overview' && stats && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3">{[['Paid sales', rupees(stats.sales)], ['Orders', stats.orders], ['Customers', stats.users]].map(([k, v]) => <div key={k} className="rounded-lg border border-line bg-white p-4"><p className="text-sm text-muted">{k}</p><p className="text-2xl font-bold">{v}</p></div>)}</div>
        <div className="rounded-lg border border-line bg-white p-4"><h2 className="font-bold">Sales, last 7 days</h2>{stats.daily.length === 0 ? <p className="text-sm text-muted">No paid orders yet.</p> : <div className="mt-3 flex h-32 items-end gap-2">{stats.daily.map((x) => <div key={x._id} className="flex-1 text-center text-xs"><div className="bg-ink" style={{ height: `${(x.total / max) * 100}%` }} title={rupees(x.total)} />{x._id.slice(5)}</div>)}</div>}</div>
        <div className="grid gap-3 md:grid-cols-2"><div className="rounded-lg border border-line bg-white p-4"><h2 className="font-bold">Recent orders</h2>{stats.recent.map((o) => <p key={o._id} className="text-sm">{o.user?.name} · {rupees(o.totalAmount)} · {o.orderStatus.toLowerCase()}</p>)}</div>
          <div className="rounded-lg border border-line bg-white p-4"><h2 className="font-bold">Low stock</h2>{stats.lowStock.length ? stats.lowStock.map((p) => <p key={p._id} className="text-sm">{p.name}: {p.stock} left</p>) : <p className="text-sm">All stocked.</p>}</div></div></div>}
      {tab === 'products' && <div className="space-y-4">
        <form className="grid gap-2 rounded-lg border border-line bg-white p-4 md:grid-cols-3" onSubmit={(e) => { e.preventDefault(); run(() => api('/products', { method: 'POST', body: { ...f, price: +f.price, discountPrice: f.discountPrice ? +f.discountPrice : undefined, stock: +f.stock } }).then(() => setF(blank))); }}>
          {[['name', 'Name'], ['price', 'Price (₹)'], ['discountPrice', 'Offer price (₹)'], ['category', 'Category'], ['brand', 'Brand'], ['stock', 'Stock']].map(([k, l]) => <input key={k} className="field" placeholder={l} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} required={['name', 'price'].includes(k)} />)}
          <textarea className="field md:col-span-3" placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <label className="text-sm md:col-span-2">Image (uploads to Cloudinary) <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && upload(e.target.files[0])} /></label><button className="btn">Add product</button>{f.images[0] && <p className="text-sm md:col-span-3">Image ready: {f.images[0]}</p>}</form>
        {products.map((p) => <div key={p._id} className="flex items-center gap-3 rounded-lg border border-line bg-white p-2"><img src={p.images?.[0]} alt="" className="h-12 w-12 rounded object-cover" /><span className="flex-1">{p.name} · {rupees(p.price)}</span>
          <input aria-label={`Stock for ${p.name}`} type="number" className="field w-20" defaultValue={p.stock} onBlur={(e) => run(() => api('/products/' + p._id, { method: 'PUT', body: { stock: +e.target.value } }))} />
          <button className="underline" onClick={() => confirm(`Delete ${p.name}?`) && run(() => api('/products/' + p._id, { method: 'DELETE' }))}>Delete</button></div>)}</div>}
      {tab === 'orders' && orders.map((o) => <div key={o._id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3"><span className="flex-1">{o.user?.name} · {rupees(o.totalAmount)} · {o.paymentStatus.toLowerCase()}</span>
        <select className="field w-auto" value={o.orderStatus} onChange={(e) => run(() => api(`/orders/${o._id}/status`, { method: 'PUT', body: { orderStatus: e.target.value } }))}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>)}
      {tab === 'customers' && users.map((u) => <p key={u._id} className="rounded-lg border border-line bg-white p-3">{u.name} · {u.email} · {u.role.toLowerCase()}</p>)}
      {tab === 'coupons' && <div className="space-y-3"><form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); run(() => api('/admin/coupons', { method: 'POST', body: cp })); }}><input className="field" placeholder="CODE" value={cp.code} onChange={(e) => setCp({ ...cp, code: e.target.value })} required /><input className="field w-24" type="number" min="1" max="90" value={cp.percent} onChange={(e) => setCp({ ...cp, percent: +e.target.value })} /><button className="btn">Add</button></form>
        {coupons.map((c) => <p key={c._id} className="flex justify-between rounded-lg border border-line bg-white p-3">{c.code} · {c.percent}% off<button className="underline" onClick={() => run(() => api('/admin/coupons/' + c._id, { method: 'DELETE' }))}>Delete</button></p>)}</div>}
    </div>
  );
}
