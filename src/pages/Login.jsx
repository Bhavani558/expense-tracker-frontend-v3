import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = await login(form);
      if (token === 'Invalid Email' || token === 'Invalid Password') {
        setError(token);
      } else {
        // decode name from token payload (base64)
        let name = form.email;

try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  name = payload.sub || form.email;
} catch {}

loginUser(token, { email: form.email, name });
navigate('/dashboard');
        
      }
    } catch {
      setError('Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>💰 Expense Tracker</h1>
        <h2 style={styles.title}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="you@email.com"
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="••••••••"
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '40px 36px',
    width: 380,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  brand: { textAlign: 'center', marginBottom: 4, fontSize: 24 },
  title: { textAlign: 'center', color: '#1e293b', marginBottom: 20, fontSize: 20 },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 16,
    fontSize: 14,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4, marginTop: 12 },
  input: {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
  },
  btn: {
    marginTop: 20,
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
  link: { color: '#2563eb', fontWeight: 600, textDecoration: 'none' },
};
