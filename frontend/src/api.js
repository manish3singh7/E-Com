const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, { method, credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}
export const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export { BASE };
