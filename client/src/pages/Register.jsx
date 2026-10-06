import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { errMsg } from '../api';

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
        <h1>Create your account</h1>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password (min 6 characters)<input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
