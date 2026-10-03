import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store';
import ProductCard from '../components/ProductCard';
const CATS = ['Textiles', 'Home', 'Kitchen', 'Stationery'];
const QUOTES = [['Priya, Pune', 'The throw is softer than it looks, and it arrived in four days.'], ['Arjun, Delhi', 'Finally a store that tells me which workshop made the thing.'], ['Meera, Chennai', 'Checkout with UPI took less than a minute.']];
export default function Home() {
  const d = useDispatch(); const { items } = useSelector((s) => s.products);
  useEffect(() => { d(fetchProducts('sort=rating&limit=8')); }, [d]);
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-6 rounded-xl bg-ink p-8 text-white md:grid-cols-2">
        <div><h1 className="text-4xl font-extrabold leading-tight md:text-5xl">Things made by hand, by people you can name.</h1>
          <p className="mt-3 max-w-md text-white/80">Textiles, kitchenware and stationery from small Indian workshops. Free shipping over ₹999.</p>
          <Link to="/products" className="mt-5 inline-block rounded-md bg-mustard px-5 py-2.5 font-bold text-ink">Browse the shop</Link></div>
        <img className="aspect-[4/3] w-full rounded-lg object-cover" alt="Handmade goods on a table" src="https://picsum.photos/seed/kaarigar-hero/800/600" />
      </section>
      <section><h2 className="mb-3 text-2xl font-bold">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{CATS.map((c) => <Link key={c} to={`/products?category=${c}`} className="rounded-lg border border-line bg-white p-5 text-lg font-semibold hover:border-ink">{c}</Link>)}</div></section>
      <section><h2 className="mb-3 text-2xl font-bold">Top rated</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.slice(0, 4).map((p) => <ProductCard key={p._id} p={p} />)}</div></section>
      <section><h2 className="mb-3 text-2xl font-bold">On offer</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.filter((p) => p.discountPrice).slice(0, 4).map((p) => <ProductCard key={p._id} p={p} />)}</div></section>
      <section><h2 className="mb-3 text-2xl font-bold">What buyers say</h2>
        <div className="grid gap-3 md:grid-cols-3">{QUOTES.map(([n, q]) => <figure key={n} className="rounded-lg border border-line bg-white p-4"><blockquote>{q}</blockquote><figcaption className="mt-2 text-sm text-muted">{n}</figcaption></figure>)}</div></section>
      <section className="rounded-lg border border-line bg-white p-6"><h2 className="text-xl font-bold">Get 10% off your first order</h2>
        <form className="mt-3 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); alert('Use code WELCOME10 at checkout.'); }}>
          <label className="sr-only" htmlFor="nl">Email</label><input id="nl" type="email" required placeholder="you@example.com" className="field" /><button className="btn">Get code</button></form></section>
    </div>
  );
}
