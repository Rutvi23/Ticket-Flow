process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { canTransition } = require('../src/utils/transitions');

const token = (role) => jwt.sign({ id: 1, role, name: 'T' }, process.env.JWT_SECRET);

describe('auth and roles (no database needed)', () => {
  test('tickets require a token', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  test('customer cannot create a category', async () => {
    const res = await request(app).post('/api/categories').set('Authorization', `Bearer ${token('customer')}`).send({ name: 'X1' });
    expect(res.status).toBe(403);
  });

  test('customer cannot change ticket status', async () => {
    const res = await request(app).patch('/api/tickets/1/status').set('Authorization', `Bearer ${token('customer')}`).send({ status: 'CLOSED' });
    expect(res.status).toBe(403);
  });

  test('register validates input', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'bad', password: '1' });
    expect(res.status).toBe(400);
  });
});

describe('status transitions', () => {
  test('valid and invalid moves', () => {
    expect(canTransition('OPEN', 'IN_PROGRESS')).toBe(true);
    expect(canTransition('RESOLVED', 'CLOSED')).toBe(true);
    expect(canTransition('OPEN', 'CLOSED')).toBe(false);
    expect(canTransition('CLOSED', 'OPEN')).toBe(false);
  });
});
