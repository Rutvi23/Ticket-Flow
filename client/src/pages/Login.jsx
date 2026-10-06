import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { errMsg } from '../api';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      nav('/');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <h1>Log in to TicketFlow</h1>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
        <p className="muted small">Demo: agent@demo.com or customer@demo.com, password: password123</p>
      </form>
    </div>
  );
}
