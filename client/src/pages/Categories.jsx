import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useToast } from '../ToastContext';

export default function Categories() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }

  const load = () => api.get('/categories').then((r) => setItems(r.data)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { load(); }, []);

  const run = async (fn, okMsg) => {
    try { await fn(); toast(okMsg); await load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  const add = (e) => { e.preventDefault(); run(async () => { await api.post('/categories', { name }); setName(''); }, 'Category added'); };
  const save = () => run(async () => { await api.put(`/categories/${editing.id}`, { name: editing.name }); setEditing(null); }, 'Category updated');
  const remove = (c) => window.confirm(`Delete "${c.name}"?`) && run(() => api.delete(`/categories/${c.id}`), 'Category deleted');

  return (
    <>
      <h1>Categories</h1>
      <form className="row" onSubmit={add}>
        <input required minLength={2} placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn">Add category</button>
      </form>
      <div className="card table-wrap">
        {items.length === 0 ? (
          <p className="muted pad">No categories yet. Add one above.</p>
        ) : (
          <table>
            <thead><tr><th>Name</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    {editing?.id === c.id
                      ? <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                      : c.name}
                  </td>
                  <td className="actions">
                    {editing?.id === c.id ? (
                      <>
                        <button className="btn small" onClick={save}>Save</button>
                        <button className="btn small ghost" onClick={() => setEditing(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn small ghost" onClick={() => setEditing({ id: c.id, name: c.name })}>Edit</button>
                        <button className="btn small danger" onClick={() => remove(c)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
