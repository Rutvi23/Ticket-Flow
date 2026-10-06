const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '8h' });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  // Public sign-up is always a customer. Agents are created by seed/admin.
  const [r] = await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [
    name,
    email,
    hash,
  ]);
  const user = { id: r.insertId, name, email, role: 'customer' };
  res.status(201).json({ token: sign(user), user });
};

exports.login = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(req.body.password, u.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  res.json({ token: sign(user), user });
};

exports.me = async (req, res) => {
  const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
};
