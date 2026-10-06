const db = require('../config/db');
const httpError = require('../utils/httpError');
const { loadTicket } = require('../utils/access');

const SELECT = `SELECT c.*, u.name AS author, u.role AS author_role
                FROM comments c JOIN users u ON u.id = c.user_id`;

exports.list = async (req, res) => {
  await loadTicket(req.params.id, req.user); // access check
  const [rows] = await db.query(`${SELECT} WHERE c.ticket_id = ? ORDER BY c.created_at`, [req.params.id]);
  res.json(rows);
};

exports.create = async (req, res) => {
  await loadTicket(req.params.id, req.user); // owner or agent only
  const [r] = await db.query('INSERT INTO comments (ticket_id, user_id, body) VALUES (?, ?, ?)', [
    req.params.id,
    req.user.id,
    req.body.body,
  ]);
  const [rows] = await db.query(`${SELECT} WHERE c.id = ?`, [r.insertId]);
  res.status(201).json(rows[0]);
};

async function loadOwnComment(id, user) {
  const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [id]);
  if (!rows[0]) throw httpError(404, 'Comment not found');
  if (rows[0].user_id !== user.id) throw httpError(403, 'Only the author can change this comment');
  return rows[0];
}

exports.update = async (req, res) => {
  const c = await loadOwnComment(req.params.id, req.user);
  await db.query('UPDATE comments SET body = ? WHERE id = ?', [req.body.body, c.id]);
  const [rows] = await db.query(`${SELECT} WHERE c.id = ?`, [c.id]);
  res.json(rows[0]);
};

exports.remove = async (req, res) => {
  const c = await loadOwnComment(req.params.id, req.user);
  await db.query('DELETE FROM comments WHERE id = ?', [c.id]);
  res.json({ message: 'Comment deleted' });
};
