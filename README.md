# Finora Finance Tracker

A personal finance tracker built with React, Express, Prisma, and PostgreSQL.

## What it does

- Signup/login with JWT auth
- Add, edit, delete transactions
- Budget tracking with alerts
- Categories based on real usage
- Dashboard analytics (daily spend, top categories, trends)
- CSV export
- INR currency formatting

## Tech stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Docker: production and dev compose files

## Run locally (without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# update DATABASE_URL and JWT_SECRET in .env
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Run with Docker

### Production-style local

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:5000

### Dev hot reload

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Deployment

See DEPLOYMENT.md for short cloud deployment steps (Render + Vercel).
