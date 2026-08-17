# Backend — Brillar Market API

Express + TypeScript + MongoDB REST API for the multi-supplier marketplace.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled production build |
| `npm run seed` | Seed database (idempotent) |

## Folder Structure

```
src/
├── config/       Database connection
├── controllers/  Request handlers
├── middleware/   Auth, validation, error handling
├── models/       Mongoose schemas
├── routes/       Express route definitions
├── services/     Business logic
├── utils/        Helpers
├── seed/         Database seed script
├── app.ts        Express app setup
└── server.ts     Entry point
```
