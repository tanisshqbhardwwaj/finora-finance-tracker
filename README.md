# Finora Finance Tracker

Finora is a full-stack personal finance tracker built with React, TypeScript, Express, Prisma, and PostgreSQL.

## Features

- JWT authentication (signup/login)
- Transaction CRUD with filters
- INR currency formatting across the UI
- Category system based on real usage:
    - No default pre-seeded categories for new users
    - New categories are auto-added when first used in a transaction
    - Categories can be removed from the Categories page
- Monthly budget tracking with over-budget warnings
- Analytics on dashboard:
    - Average daily spend (last 30 days)
    - Spent today
    - Expense-to-income ratio
    - Top expense categories (current month)
    - 6-month expense trend
- CSV export of transactions
- Docker support:
    - Production-style compose stack
    - Development compose stack with hot reload

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose, Nginx (frontend container) |

## Project Structure

```text
finora-finance-tracker/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── types/
│   │   └── index.ts
│   ├── Dockerfile
│   └── Dockerfile.dev
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.dev.yml
└── DEPLOYMENT.md
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login user |

### Transactions (auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/transactions | List transactions (filterable + paginated) |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |

### Categories (auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/categories | List user categories |
| POST | /api/categories | Create category |
| DELETE | /api/categories/:id | Delete category |

### Dashboard (auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard | Balance, totals, recent transactions, analytics |

### Budgets (auth required)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/budgets | Set/update monthly budget |
| GET | /api/budgets | Get current month budget |
| GET | /api/budgets/check | Budget vs spending status |

### Export (auth required)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/export/transactions | Download CSV export |

## Local Setup (Without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL and JWT_SECRET in .env
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Docker Setup

### Production-style local stack

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

### Development stack (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render/Vercel deployment and Docker workflows.
