# Brillar Market — Multi-Supplier E-Commerce Marketplace

A production-style multi-supplier marketplace MVP with separate frontend and backend applications.

## Architecture

```
/
├── frontend/     Next.js 16 + TypeScript + MUI (App Router)
└── backend/      Express + TypeScript + MongoDB + Mongoose
```

### Roles

| Role | Description |
|------|-------------|
| **Guest** | Browse products, search, view FAQ (not stored) |
| **Customer** | Shop, cart, checkout, orders |
| **Supplier** | Manage products, orders, earnings (after approval) |
| **Admin** | Marketplace operations, supplier applications, FAQ |

### Multi-Supplier Order Design

Orders use a **nested `supplierOrders[]` structure** within a single parent `Order` document:

- One customer checkout creates **one order** with shared delivery/payment info
- Each supplier gets their own `supplierOrder` sub-document with items, subtotal, and independent `fulfillmentStatus`
- Product name, price, and cost are **snapshotted** at checkout time
- Suppliers query orders filtered by `supplierOrders.supplierId` and only see their portion
- This avoids duplicate order records while keeping supplier data isolated

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a remote URI)

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/marketplace
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit values as needed
npm run seed           # seed demo data (idempotent)
npm run dev            # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev            # starts on http://localhost:3000
```

## Development Demo Accounts

> **These credentials are for local/demo development only. Never use them in production.**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | admin123 |
| Supplier | supplier1@ecommerce.com | supplier123 |
| Customer | customer1@ecommerce.com | customer123 |

Additional seeded suppliers: `supplier2@ecommerce.com`, `supplier3@ecommerce.com` (password: `supplier123`)

## API Base URL

```
http://localhost:5000/api
```

Health check: `GET /api/health`

## Main API Routes

| Area | Prefix |
|------|--------|
| Auth | `/api/auth` |
| Public catalog | `/api/products`, `/api/categories`, `/api/faq` |
| Customer cart/orders | `/api/cart`, `/api/checkout`, `/api/orders` |
| Supplier portal | `/api/supplier/*` |
| Admin portal | `/api/admin/*` |

## Seed Data

The seed script creates:

- 1 admin, 3 approved suppliers, 10 customers
- 4–6 categories, 24 products, several orders, 6 FAQs
- 2 pending supplier applications, 1 rejected application

Run with: `npm run seed` (from `backend/`)

## Key Flows

1. **Guest → Browse** — Public product catalog with search/filter
2. **Customer → Checkout** — Multi-supplier cart, simulated payment
3. **Become Supplier** — Application → Admin review → Approval
4. **Supplier Portal** — Products, orders, fulfillment, earnings
5. **Admin Portal** — Applications, suppliers, customers, orders, FAQ

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with role-based authorization
- Rate limiting on auth routes
- Helmet + CORS configured
- Backend validates prices, stock, and ownership — never trusts frontend values
