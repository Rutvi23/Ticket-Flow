import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useToast } from '../ToastContext';

// One component for both Create and Edit
export default function TicketForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', category_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch((e) => toast(errMsg(e), 'error'));
    if (editing) {
      api.get(`/tickets/${id}`)
        .then(({ data }) => setForm({ title: data.title, description: data.description, priority: data.priority, category_id: data.category_id || '' }))
        .catch((e) => { toast(errMsg(e), 'error'); nav('/tickets'); });
    }
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, category_id: form.category_id || null };
      const { data } = editing ? await api.put(`/tickets/${id}`, body) : await api.post('/tickets', body);
      toast(editing ? 'Ticket updated' : 'Ticket created');
      nav(`/tickets/${data.id}`);
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h1>{editing ? 'Edit ticket' : 'New ticket'}</h1>
      <label>Title<input required minLength={3} maxLength={200} value={form.title} onChange={set('title')} /></label>
      <label>Description<textarea required rows={6} value={form.description} onChange={set('description')} /></label>
      <div className="row">
        <label className="grow">Priority
          <select value={form.priority} onChange={set('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="grow">Category
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <div className="row">
        <button className="btn" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create ticket'}</button>
        <button type="button" className="btn ghost" onClick={() => nav(-1)}>Cancel</button>
      </div>
    </form>
  );
}
