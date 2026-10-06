# TicketFlow: Support Ticket & Helpdesk System

Full-stack helpdesk app: React UI, Express REST API, MySQL database.
Customers raise tickets; agents assign, move them through a status workflow and reply.

**Stack:** Node.js, Express, MySQL, React (Vite), JWT, Chart.js, Jest + Supertest, GitHub Actions

## Features
- JWT authentication, bcrypt password hashing, role-based access (customer / agent)
- Full CRUD: tickets, comments, categories (React form -> REST API -> SQL)
- Customers can only see their own tickets; edit/delete only while OPEN
- Status workflow with server-side validation: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
- Search, filters and server-side pagination
- Dashboard with Chart.js (status, priority, last 7 days)
- Input validation (express-validator), central error handler, parameterized SQL

## Run locally
Requirements: Node 18+ and MySQL 8.

```bash
# 1. Database
mysql -u root -p < server/schema.sql

# 2. API
cd server
cp .env.example .env        # then edit DB_PASS and JWT_SECRET
npm install
npm run seed                # demo users + 20 tickets
npm run dev                 # http://localhost:5000

# 3. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo logins (password `password123`): `agent@demo.com`, `customer@demo.com`

## API
| Resource | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Categories | GET, POST /api/categories; PUT, DELETE /api/categories/:id (agent) |
| Tickets | GET, POST /api/tickets (?status=&priority=&q=&page=&limit=); GET, PUT, DELETE /api/tickets/:id |
| Workflow | PATCH /api/tickets/:id/status, PATCH /api/tickets/:id/assign (agent) |
| Comments | GET, POST /api/tickets/:id/comments; PUT, DELETE /api/comments/:id (author) |
| Stats | GET /api/stats |

## Tests
`cd server && npm test`

## Deploy
- Database: Aiven, Railway or AWS RDS (run schema.sql, then seed)
- API: Render or AWS. Env vars: DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, CLIENT_URL (your frontend URL)
- Frontend: Vercel or Netlify. Build command `npm run build`, output `dist`, env var `VITE_API_URL=https://<your-api>/api`
- For Vercel/Netlify, add a rewrite of all routes to `/index.html` so React Router works on refresh
