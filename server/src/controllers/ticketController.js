const db = require('../config/db');
const httpError = require('../utils/httpError');
const { loadTicket } = require('../utils/access');
const { canTransition } = require('../utils/transitions');

// GET /api/tickets?status=&priority=&q=&page=&limit=
exports.list = async (req, res) => {
  const { status, priority, q } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];
  if (req.user.role === 'customer') {
    where.push('t.created_by = ?'); // customers only ever see their own tickets
    params.push(req.user.id);
  }
  if (status) { where.push('t.status = ?'); params.push(status); }
  if (priority) { where.push('t.priority = ?'); params.push(priority); }
  if (q) { where.push('t.title LIKE ?'); params.push(`%${q}%`); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM tickets t ${w}`, params);
  const [rows] = await db.query(
    `SELECT t.*, c.name AS category, u.name AS created_by_name, a.name AS assigned_to_name
     FROM tickets t
     LEFT JOIN categories c ON c.id = t.category_id
     JOIN users u ON u.id = t.created_by
     LEFT JOIN users a ON a.id = t.assigned_to
     ${w}
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  res.json({ data: rows, total, page, limit });
};

exports.getOne = async (req, res) => {
  res.json(await loadTicket(req.params.id, req.user));
};

exports.create = async (req, res) => {
  const { title, description, priority = 'MEDIUM', category_id } = req.body;
  const [r] = await db.query(
    'INSERT INTO tickets (title, description, priority, category_id, created_by) VALUES (?, ?, ?, ?, ?)',
    [title, description, priority, category_id || null, req.user.id]
  );
  res.status(201).json(await loadTicket(r.insertId, req.user));
};

exports.update = async (req, res) => {
  const t = await loadTicket(req.params.id, req.user);
  if (t.created_by !== req.user.id) throw httpError(403, 'Only the ticket owner can edit it');
  if (t.status !== 'OPEN') throw httpError(400, 'Only OPEN tickets can be edited');

  const { title, description, priority = 'MEDIUM', category_id } = req.body;
  await db.query('UPDATE tickets SET title = ?, description = ?, priority = ?, category_id = ? WHERE id = ?', [
    title,
    description,
    priority,
    category_id || null,
    t.id,
  ]);
  res.json(await loadTicket(t.id, req.user));
};

exports.remove = async (req, res) => {
  const t = await loadTicket(req.params.id, req.user);
  if (t.created_by !== req.user.id) throw httpError(403, 'Only the ticket owner can delete it');
  if (t.status !== 'OPEN') throw httpError(400, 'Only OPEN tickets can be deleted');
  await db.query('DELETE FROM tickets WHERE id = ?', [t.id]);
  res.json({ message: 'Ticket deleted' });
};

// PATCH /api/tickets/:id/status  (agent only)
exports.setStatus = async (req, res) => {
  const t = await loadTicket(req.params.id, req.user);
  const next = req.body.status;
  if (!canTransition(t.status, next)) {
    throw httpError(400, `Cannot move a ticket from ${t.status} to ${next}`);
  }
  await db.query('UPDATE tickets SET status = ? WHERE id = ?', [next, t.id]);
  res.json(await loadTicket(t.id, req.user));
};

// PATCH /api/tickets/:id/assign  (agent only, assigns to the calling agent)
exports.assignToMe = async (req, res) => {
  const t = await loadTicket(req.params.id, req.user);
  await db.query('UPDATE tickets SET assigned_to = ? WHERE id = ?', [req.user.id, t.id]);
  res.json(await loadTicket(t.id, req.user));
};
