import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import Badge from '../components/Badge';

// Mirrors the server rule so agents only see valid next steps
const NEXT = { OPEN: ['IN_PROGRESS'], IN_PROGRESS: ['RESOLVED'], RESOLVED: ['CLOSED', 'IN_PROGRESS'], CLOSED: [] };

export default function TicketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null); // { id, body }

  const load = async () => {
    try {
      const [t, c] = await Promise.all([api.get(`/tickets/${id}`), api.get(`/tickets/${id}/comments`)]);
      setTicket(t.data);
      setComments(c.data);
    } catch (e) {
      toast(errMsg(e), 'error');
      nav('/tickets');
    }
  };
  useEffect(() => { load(); }, [id]);

  if (!ticket) return <p className="muted">Loading ticket...</p>;

  const isAgent = user.role === 'agent';
  const canEdit = ticket.created_by === user.id && ticket.status === 'OPEN';

  const run = async (fn, okMsg) => {
    try { await fn(); if (okMsg) toast(okMsg); await load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  const setStatus = (s) => run(() => api.patch(`/tickets/${id}/status`, { status: s }), 'Status updated');
  const assign = () => run(() => api.patch(`/tickets/${id}/assign`), 'Ticket assigned to you');
  const addComment = (e) => { e.preventDefault(); run(async () => { await api.post(`/tickets/${id}/comments`, { body: text }); setText(''); }, 'Comment added'); };
  const saveComment = () => run(async () => { await api.put(`/comments/${editing.id}`, { body: editing.body }); setEditing(null); }, 'Comment updated');
  const deleteComment = (cid) => window.confirm('Delete this comment?') && run(() => api.delete(`/comments/${cid}`), 'Comment deleted');
  const deleteTicket = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    try { await api.delete(`/tickets/${id}`); toast('Ticket deleted'); nav('/tickets'); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <Link to="/tickets" className="muted">Back to tickets</Link>
      <div className="card detail">
        <div className="row between">
          <h1>#{ticket.id} {ticket.title}</h1>
          {canEdit && (
            <div className="row">
              <Link className="btn small ghost" to={`/tickets/${id}/edit`}>Edit</Link>
              <button className="btn small danger" onClick={deleteTicket}>Delete</button>
            </div>
          )}
        </div>
        <div className="row meta">
          <Badge value={ticket.status} /> <Badge value={ticket.priority} />
          <span>Category: {ticket.category || 'None'}</span>
          <span>Created by {ticket.created_by_name}</span>
          <span>Assigned to {ticket.assigned_to_name || 'nobody yet'}</span>
        </div>
        <p className="desc">{ticket.description}</p>

        {isAgent && (
          <div className="row agent-box">
            <button className="btn small ghost" onClick={assign} disabled={ticket.assigned_to === user.id}>Assign to me</button>
            {NEXT[ticket.status].map((s) => (
              <button key={s} className="btn small" onClick={() => setStatus(s)}>Move to {s.replace('_', ' ').toLowerCase()}</button>
            ))}
            {NEXT[ticket.status].length === 0 && <span className="muted">This ticket is closed.</span>}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Comments ({comments.length})</h3>
        {comments.length === 0 && <p className="muted">No comments yet. Start the conversation below.</p>}
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="row between">
              <strong>{c.author} <span className="muted">({c.author_role})</span></strong>
              <span className="muted small">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            {editing?.id === c.id ? (
              <>
                <textarea rows={3} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
                <div className="row">
                  <button className="btn small" onClick={saveComment}>Save</button>
                  <button className="btn small ghost" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <p>{c.body}</p>
            )}
            {c.user_id === user.id && editing?.id !== c.id && (
              <div className="row">
                <button className="link" onClick={() => setEditing({ id: c.id, body: c.body })}>Edit</button>
                <button className="link danger-text" onClick={() => deleteComment(c.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        <form onSubmit={addComment} className="form">
          <textarea rows={3} required placeholder="Write a reply" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn small">Add comment</button>
        </form>
      </div>
    </>
  );
}
