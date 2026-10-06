const db = require('../config/db');

exports.get = async (req, res) => {
  const isCustomer = req.user.role === 'customer';
  const where = isCustomer ? 'WHERE created_by = ?' : '';
  const p = isCustomer ? [req.user.id] : [];

  const [byStatus] = await db.query(`SELECT status, COUNT(*) AS count FROM tickets ${where} GROUP BY status`, p);
  const [byPriority] = await db.query(`SELECT priority, COUNT(*) AS count FROM tickets ${where} GROUP BY priority`, p);
  const [perDay] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS count
     FROM tickets
     ${isCustomer ? 'WHERE created_by = ? AND' : 'WHERE'} created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY day ORDER BY day`,
    p
  );
  res.json({ byStatus, byPriority, perDay });
};
