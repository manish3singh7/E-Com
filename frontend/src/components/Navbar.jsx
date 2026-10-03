import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store';
export default function Navbar() {
  const { user } = useSelector((s) => s.auth); const count = useSelector((s) => s.cart.items.reduce((a, i) => a + i.qty, 0));
  const d = useDispatch(); const nav = useNavigate();
  const link = ({ isActive }) => (isActive ? 'font-semibold underline decoration-mustard decoration-2 underline-offset-4' : 'hover:underline');
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">Kaarigar</Link>
        <nav className="flex flex-1 flex-wrap items-center gap-5">
          <NavLink to="/products" className={link}>Shop</NavLink>
          {user && <NavLink to="/orders" className={link}>My orders</NavLink>}
          {user?.role === 'ADMIN' && <NavLink to="/admin" className={link}>Admin</NavLink>}
        </nav>
        <Link to="/cart" className="font-semibold">Cart ({count})</Link>
        {user ? <button className="btn-alt" onClick={async () => { await d(logout()); nav('/'); }}>Log out</button> : <Link className="btn" to="/login">Log in</Link>}
      </div>
    </header>
  );
}
