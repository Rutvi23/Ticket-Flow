const db = require('../config/db');
const httpError = require('./httpError');

// Loads a ticket and enforces the rule: customers can only see their own tickets
async function loadTicket(id, user) {
  const [rows] = await db.query(
    `SELECT t.*, c.name AS category, u.name AS created_by_name, a.name AS assigned_to_name
     FROM tickets t
     LEFT JOIN categories c ON c.id = t.category_id
     JOIN users u ON u.id = t.created_by
     LEFT JOIN users a ON a.id = t.assigned_to
     WHERE t.id = ?`,
    [id]
  );
  const ticket = rows[0];
  if (!ticket) throw httpError(404, 'Ticket not found');
  if (user.role === 'customer' && ticket.created_by !== user.id) {
    throw httpError(403, 'You cannot access this ticket');
  }
  return ticket;
}

module.exports = { loadTicket };
