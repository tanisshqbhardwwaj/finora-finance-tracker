# Deployment

Simple deployment plan for Finora.

## Option 1: Docker (quickest)

### Start production-style local stack

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:5000

### Start development stack (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Stop

```bash
docker compose down
# or
docker compose -f docker-compose.dev.yml down
```

## Option 2: Cloud (Render + Vercel)

### Fast fix for Prisma P1012 on Render

If you see `Environment variable not found: DATABASE_URL`, deploy backend using the `render.yaml` Blueprint in this repo.
This auto-connects `DATABASE_URL` from Render Postgres.

Steps:

1. In Render: New + > Blueprint
2. Select this GitHub repository
3. Render will create:
	- `finora-db` (Postgres)
	- `finora-backend` (Web Service)
4. Deploy

## Backend on Render

1. Create a Render Web Service from this repo.
2. Set Root Directory to `backend`.
3. Build command:

```bash
npm install && npx prisma generate && npm run build
```

4. Start command:

```bash
npm start
```

5. Add env vars:

```env
DATABASE_URL=<postgres_connection_string>
JWT_SECRET=<long_random_secret>
NODE_ENV=production
PORT=5000
```

Note: Prisma needs `DATABASE_URL` during build, so this variable must be added on the backend service before deploying.

6. Run migration once in Render shell:

```bash
npx prisma migrate deploy
```

If Render still errors, redeploy the backend with **Clear build cache and deploy**.

## Frontend on Vercel

1. Import repo in Vercel.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env var:

```env
VITE_API_URL=https://<your-render-backend-domain>/api
```

## Final check

- Signup/login works
- Transactions and categories work
- Budget and analytics load
- CSV export works
