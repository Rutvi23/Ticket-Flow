const db = require('../config/db');

exports.list = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
};

exports.create = async (req, res) => {
  try {
    const [r] = await db.query('INSERT INTO categories (name) VALUES (?)', [req.body.name]);
    res.status(201).json({ id: r.insertId, name: req.body.name });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Category already exists' });
    throw e;
  }
};

exports.update = async (req, res) => {
  try {
    const [r] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [req.body.name, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ id: Number(req.params.id), name: req.body.name });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Category already exists' });
    throw e;
  }
};

exports.remove = async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Category is used by tickets and cannot be deleted' });
    }
    throw e;
  }
};
