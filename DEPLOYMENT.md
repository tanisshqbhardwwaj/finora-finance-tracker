# Deployment Guide

This guide covers local Docker usage and cloud deployment for Finora.

## 1. Docker (Recommended for Local and Staging)

### Production-style local stack

Run from project root:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- Backend health: http://localhost:5000/health

Stop stack:

```bash
docker compose down
```

Reset database volume:

```bash
docker compose down -v
```

### Development stack with hot reload

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:

- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:5000

Stop dev stack:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset dev database volume:

```bash
docker compose -f docker-compose.dev.yml down -v
```

## 2. Cloud Deployment (Render + Vercel)

## Prerequisites

- A PostgreSQL database (Render managed DB, Neon, Supabase, or Railway)
- A Render account for backend hosting
- A Vercel account for frontend hosting

## Backend deployment (Render)

1. Push repository to GitHub.
2. In Render, create a new Web Service.
3. Configure:
   - Root Directory: backend
   - Runtime: Node
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: npm start
4. Add environment variables:
   - DATABASE_URL=<your_postgres_connection_string>
   - JWT_SECRET=<long_random_secret>
   - NODE_ENV=production
   - PORT=5000
5. After first deploy, run migrations in Render shell:

```bash
npx prisma migrate deploy
```

## Frontend deployment (Vercel)

1. In Vercel, import the GitHub repository.
2. Set project Root Directory to frontend.
3. Configure:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Set frontend env variable:
   - VITE_API_URL=https://<your-render-backend-domain>/api

## 3. Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@host:5432/finora"
JWT_SECRET="your-long-random-secret"
PORT=5000
NODE_ENV="production"
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-domain/api
```

## 4. Post-deployment Checklist

- Database is reachable from backend
- Backend starts without migration errors
- Frontend can call backend API
- CORS allows frontend domain
- Signup/login works
- Transactions, budgets, categories, analytics, and CSV export work
# Deployment Guide

This guide covers deploying the Finora Finance Tracker backend on **Render.com** and the frontend on **Vercel**.

---

## Docker (Local Full Stack)

You can run PostgreSQL + backend + frontend together with Docker Compose.

### Prerequisite

- Docker Desktop installed and running

### Start all services

From project root:

```bash
docker compose up --build
```

### App URLs

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`

### Stop services

```bash
docker compose down
```

### Reset database volume (fresh DB)

```bash
docker compose down -v
```

### Notes

- Backend runs `prisma migrate deploy` automatically on container start.
- Docker Compose uses these default DB credentials for local use:
   - user: `finora`
   - password: `finora123`
   - database: `finora`

### Development Hot Reload (Docker)

Use the development compose file to enable live code updates for backend and frontend.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Development URLs:

- Frontend (Vite): `http://localhost:5173`
- Backend API: `http://localhost:5000`

Stop dev stack:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset dev database volume:

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Prerequisites

- A [Render.com](https://render.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- A PostgreSQL database (Render managed DB, Neon, or Supabase — all have free tiers)

---

## 1. Database Setup

### Option A: Render Managed PostgreSQL (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → PostgreSQL**
3. Fill in:
   - **Name**: `finora-db`
   - **Region**: nearest to you
   - **Plan**: Free
4. Click **Create Database**
5. Copy the **External Database URL** — you'll need it in the next step

### Option B: Neon (Free Serverless Postgres)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project named `finora`
3. Copy the connection string

---

## 2. Backend Deployment (Render.com)

### Step 1: Push your code to GitHub

Make sure your repository is on GitHub with the `backend/` directory committed.

### Step 2: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `finora-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables on Render

In your web service settings, add these environment variables:

| Key          | Value                                    |
|--------------|------------------------------------------|
| DATABASE_URL | Your PostgreSQL connection string        |
| JWT_SECRET   | A long random string (e.g. from `openssl rand -hex 32`) |
| NODE_ENV     | production                               |
| PORT         | 5000                                     |

### Step 4: Run Database Migrations

After the first deploy, go to Render's **Shell** tab and run:
```bash
npx prisma migrate deploy
```

Your backend will be live at: `https://finora-backend.onrender.com`

---

## 3. Frontend Deployment (Vercel)

### Step 1: Update the API base URL

In `frontend/src/api/client.ts`, the `baseURL` is set to `/api`. For production, you need to set this to your backend URL.

Create a `.env.production` file in the `frontend/` directory:
```env
VITE_API_URL=https://finora-backend.onrender.com/api
```

Update `frontend/src/api/client.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://finora-backend.onrender.com/api`
5. Click **Deploy**

### Step 3: Update CORS on Backend

Add your Vercel URL to the CORS config in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:5173'],
}));
```

---

## 4. Environment Variables Summary

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/finora"
JWT_SECRET="your-long-random-secret"
PORT=5000
NODE_ENV="production"
```

### Frontend (.env.production)
```env
VITE_API_URL=https://finora-backend.onrender.com/api
```

---

## 5. Post-Deployment Checklist

- [ ] Database is created and accessible
- [ ] Backend deployed on Render with correct environment variables
- [ ] Database migrations ran successfully (`prisma migrate deploy`)
- [ ] Frontend deployed on Vercel with `VITE_API_URL` pointing to backend
- [ ] CORS updated to allow Vercel domain
- [ ] Test signup, login, transactions, budget, and CSV export
