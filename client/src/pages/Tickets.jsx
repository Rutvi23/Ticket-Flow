import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useToast } from '../ToastContext';
import Badge from '../components/Badge';

const LIMIT = 8;

export default function Tickets() {
  const toast = useToast();
  const [result, setResult] = useState({ data: [], total: 0 });
  const [filters, setFilters] = useState({ q: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debounced fetch: waits 300ms after the last change before calling the API
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/tickets', { params: { ...filters, page, limit: LIMIT } });
        setResult(data);
      } catch (e) {
        toast(errMsg(e), 'error');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const change = (key, value) => { setFilters({ ...filters, [key]: value }); setPage(1); };
  const pages = Math.max(Math.ceil(result.total / LIMIT), 1);

  return (
    <>
      <div className="row between">
        <h1>Tickets</h1>
        <Link className="btn" to="/tickets/new">New ticket</Link>
      </div>

      <div className="filters">
        <input placeholder="Search by title" value={filters.q} onChange={(e) => change('q', e.target.value)} />
        <select value={filters.status} onChange={(e) => change('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={filters.priority} onChange={(e) => change('priority', e.target.value)}>
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="card table-wrap">
        {loading ? (
          <p className="muted pad">Loading tickets...</p>
        ) : result.data.length === 0 ? (
          <p className="muted pad">No tickets match. Try clearing the filters or create a new ticket.</p>
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Created by</th><th>Assigned to</th></tr>
            </thead>
            <tbody>
              {result.data.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td><Link to={`/tickets/${t.id}`}>{t.title}</Link></td>
                  <td>{t.category || '-'}</td>
                  <td><Badge value={t.priority} /></td>
                  <td><Badge value={t.status} /></td>
                  <td>{t.created_by_name}</td>
                  <td>{t.assigned_to_name || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="row pager">
        <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {pages} ({result.total} tickets)</span>
        <button className="btn small ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>
  );
}
