import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError } from '../store';
function Form({ mode }) {
  const d = useDispatch(); const nav = useNavigate(); const error = useSelector((s) => s.auth.error);
  const [f, setF] = useState({ name: '', email: '', password: '' }); const isReg = mode === 'register';
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="mx-auto max-w-sm space-y-3" onSubmit={async (e) => { e.preventDefault(); const r = await d((isReg ? register : login)(f)); if (!r.error) nav('/'); }}>
      <h1 className="text-2xl font-extrabold">{isReg ? 'Create your account' : 'Log in'}</h1>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {isReg && <input className="field" placeholder="Name" value={f.name} onChange={on('name')} required />}
      <input className="field" type="email" placeholder="Email" value={f.email} onChange={on('email')} required />
      <input className="field" type="password" placeholder="Password (8+ characters)" minLength={8} value={f.password} onChange={on('password')} required />
      <button className="btn w-full">{isReg ? 'Create account' : 'Log in'}</button>
      <p className="text-sm">{isReg ? 'Have an account?' : 'New here?'} <Link className="underline" onClick={() => d(clearError())} to={isReg ? '/login' : '/register'}>{isReg ? 'Log in' : 'Create an account'}</Link></p>
    </form>
  );
}
export const Login = () => <Form mode="login" />;
export const Register = () => <Form mode="register" />;
