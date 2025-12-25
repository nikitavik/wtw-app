# WTW App - Deployment Guide

## Development (with Hot Reloading)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Changes to code automatically reload the server
- Local files are mounted into the container

## Production

```bash
docker-compose up --build
```

## Services

- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050 (admin@wtw-app.com / admin)
