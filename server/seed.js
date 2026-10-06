// Fills the database with demo users, categories, tickets and comments.
// Run: npm run seed   (safe to re-run, it clears old data first)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  const hash = await bcrypt.hash('password123', 10);

  await db.query('DELETE FROM comments');
  await db.query('DELETE FROM tickets');
  await db.query('DELETE FROM categories');
  await db.query('DELETE FROM users');

  const [a] = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Asha Agent', 'agent@demo.com', hash, 'agent']);
  const [c1] = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Chirag Customer', 'customer@demo.com', hash, 'customer']);
  const [c2] = await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Divya Customer', 'customer2@demo.com', hash, 'customer']);
  const agentId = a.insertId;
  const customers = [c1.insertId, c2.insertId];

  const catIds = [];
  for (const name of ['Billing', 'Technical', 'Account', 'Feature Request']) {
    const [r] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    catIds.push(r.insertId);
  }

  const titles = [
    'Cannot log in after password reset', 'Invoice shows wrong amount', 'App crashes on upload', 'Request dark mode',
    'Unable to change email address', 'Payment failed but money deducted', 'Export to CSV is slow', 'Need bulk user import',
    'Notification emails not arriving', 'Two-factor code not received', 'Dashboard numbers look incorrect', 'Add support for UPI refunds',
    'Page loads very slowly', 'Cannot delete old project', 'Subscription not upgrading', 'Mobile layout is broken',
    'Request API access', 'Wrong tax applied on invoice', 'Profile photo will not save', 'Search returns no results',
  ];

  for (const title of titles) {
    const status = pick(['OPEN', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
    const assigned = status === 'OPEN' ? null : agentId;
    const [r] = await db.query(
      `INSERT INTO tickets (title, description, priority, status, category_id, created_by, assigned_to, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [title, `Details: ${title}. Please look into this as soon as possible.`, pick(['LOW', 'MEDIUM', 'HIGH']), status, pick(catIds), pick(customers), assigned, Math.floor(Math.random() * 7)]
    );
    if (status !== 'OPEN') {
      await db.query('INSERT INTO comments (ticket_id, user_id, body) VALUES (?, ?, ?)', [r.insertId, agentId, 'Thanks for reporting this, we are looking into it.']);
    }
  }

  console.log('Seeded. Logins (password: password123): agent@demo.com, customer@demo.com, customer2@demo.com');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
