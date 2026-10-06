const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, name }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Forbidden' });

module.exports = auth;
module.exports.requireRole = requireRole;
