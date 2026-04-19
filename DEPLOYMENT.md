# Deployment

Simple local run guide for Finora.

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

## Notes

- This file now only covers local Docker usage.
- Cloud deployment steps were removed.
