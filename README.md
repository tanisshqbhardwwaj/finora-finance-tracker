# Finora Finance Tracker

A full-stack personal finance tracker built with React, TypeScript, Express, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based authentication (signup & login)
- 💳 Transaction management (income & expenses) with CRUD operations
- 📊 Dashboard with balance, income, expenses, and recent transactions
- 🎯 Monthly budget management with progress tracking and overspend warnings
- 🏷️ Custom category management
- ⬇️ CSV export of all transactions
- 📱 Responsive UI built with Tailwind CSS

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend  | Node.js, Express, TypeScript            |
| Database | PostgreSQL via Prisma ORM               |
| Auth     | JSON Web Tokens (JWT) + bcrypt          |

## Project Structure

```
finora-finance-tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database models
│   └── src/
│       ├── controllers/
│       │   ├── auth.ts          # Signup & login
│       │   ├── transactions.ts  # CRUD for transactions
│       │   ├── categories.ts    # Category management
│       │   ├── dashboard.ts     # Analytics summary
│       │   ├── budget.ts        # Monthly budget logic
│       │   └── export.ts        # CSV export
│       ├── middleware/
│       │   └── auth.ts          # JWT verification middleware
│       ├── routes/              # Express routers
│       ├── types/
│       │   └── index.ts         # Shared TypeScript interfaces
│       └── index.ts             # Express app entry point
└── frontend/
    └── src/
        ├── api/
        │   └── client.ts        # Axios instance with auth interceptor
        ├── components/
        │   ├── Sidebar.tsx      # Navigation sidebar
        │   ├── BudgetCard.tsx   # Budget progress display
        │   └── BudgetForm.tsx   # Form to set monthly budget
        ├── context/
        │   └── AuthContext.tsx  # Auth state & helpers
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx
            ├── Transactions.tsx
            ├── Budget.tsx
            └── Categories.tsx
```

## API Endpoints

### Authentication
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | /api/auth/signup  | Register new user   |
| POST   | /api/auth/login   | Login               |

### Transactions (requires auth)
| Method | Endpoint                 | Description               |
|--------|--------------------------|---------------------------|
| GET    | /api/transactions        | List transactions (filterable) |
| POST   | /api/transactions        | Create transaction        |
| PUT    | /api/transactions/:id    | Update transaction        |
| DELETE | /api/transactions/:id    | Delete transaction        |

### Categories (requires auth)
| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | /api/categories   | List user categories   |
| POST   | /api/categories   | Create custom category |

### Dashboard (requires auth)
| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| GET    | /api/dashboard  | Balance, income, expenses, recent transactions |

### Budgets (requires auth)
| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | /api/budgets         | Set/update monthly budget    |
| GET    | /api/budgets         | Get current month's budget   |
| GET    | /api/budgets/check   | Check budget vs spending     |

### Export (requires auth)
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/export/transactions    | Download transactions CSV |

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT secret
npx prisma migrate dev --name init
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs at `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment instructions using Render.com (backend) and Vercel (frontend).
