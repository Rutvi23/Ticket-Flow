require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/stats', require('./routes/stats'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(require('./middleware/errorHandler'));

module.exports = app;
