# Brillar Market — Multi-Supplier E-Commerce Marketplace

A production-style multi-supplier marketplace MVP with separate frontend and backend applications.

## Architecture

```
/
├── frontend/     Next.js 16 + TypeScript + MUI (App Router)
├── backend/      Express + TypeScript + MongoDB + Mongoose
└── ecosystem.config.cjs   PM2 process manager (optional)
```

### Roles

| Role | Description |
|------|-------------|
| **Guest** | Browse products, search, view FAQ |
| **Customer** | Shop, cart, checkout, orders |
| **Supplier** | Supplier portal only — products, orders, earnings (after approval) |
| **Admin** | Marketplace operations, supplier applications, FAQ |

### Multi-Supplier Order Design

Orders use a **nested `supplierOrders[]` structure** within a single parent `Order` document:

- One customer checkout creates **one order** with shared delivery/payment info
- Each supplier gets their own `supplierOrder` sub-document with items, subtotal, and independent `fulfillmentStatus`
- Product name, price, and cost are **snapshotted** at checkout time
- Suppliers query orders filtered by `supplierOrders.supplierId` and only see their portion

## Prerequisites

- Node.js 18+
- MongoDB (local or remote URI)
- Optional: [PM2](https://pm2.keymetrics.io/) for process management

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example` and edit:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/marketplace
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Optional for absolute upload URLs in production:

```env
API_PUBLIC_URL=https://your-api-host.example.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production builds, set `NEXT_PUBLIC_API_URL` **before** `npm run build` in `frontend/`.

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit values as needed
npm run seed           # seed demo data (idempotent)
npm run dev            # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
# create frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:3000
```

### 3. PM2 (optional)

From the repository root:

```bash
# Development (tsx watch + next dev)
pm2 start ecosystem.config.cjs --only brillar-api-dev,brillar-web-dev

# Production (run builds first — see ecosystem.config.cjs header)
pm2 start ecosystem.config.cjs --only brillar-api,brillar-web --env production
```

Logs: `./logs/` · Status: `pm2 status` · Restart: `pm2 restart all`

## Development Demo Accounts

> **Local/demo only. Never use in production.**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | admin123 |
| Supplier | supplier1@ecommerce.com | supplier123 |
| Customer | customer1@ecommerce.com | customer123 |

Additional seeded suppliers: `supplier2@ecommerce.com`, `supplier3@ecommerce.com` (password: `supplier123`)

Suppliers are redirected to `/supplier` after login and cannot use the customer storefront.

## API

Base URL: `http://localhost:5000/api`

Health check: `GET /api/health`

| Area | Prefix |
|------|--------|
| Auth | `/api/auth` |
| Public catalog | `/api/products`, `/api/categories`, `/api/faq`, `/api/home` |
| Customer cart/orders | `/api/cart`, `/api/checkout`, `/api/orders` |
| Supplier portal | `/api/supplier/*` |
| Admin portal | `/api/admin/*` |

### Product list filters (`GET /api/products`)

| Param | Description |
|-------|-------------|
| `search` | Case-insensitive match on name, description, SKU, brand |
| `category` | Category slug |
| `gender` | `male`, `female`, `unisex`, `boys`, `girls` |
| `type` | Product type slug (e.g. `shirt`, `ring`, `necklace`) |
| `age` | Numeric age — matches products whose `minAge`/`maxAge` range includes it |
| `minPrice`, `maxPrice` | Price range |
| `inStock` | `true` for in-stock only |
| `sort` | `newest`, `price_asc`, `price_desc`, `name` |
| `page`, `limit` | Pagination |

List endpoints that support pagination return `{ items, pagination }` when `page`/`limit` are sent; omitting them keeps backward-compatible array responses where applicable.

## Storefront Search

The header search box parses natural language into filters:

- **Category** — e.g. `electronics`, `jewellery`, `fashion accessories`
- **Type** — e.g. `shirt`, `ring`, `necklace`, `headphones`
- **Gender** — e.g. `male`, `women`, `boys`
- **Age** — e.g. `10`, `10 years old`, `adult`, `middle age`, `kids`
- **Keywords** — remaining text (e.g. `noise cancelling`)

Examples:

- `jewellery necklace female`
- `male shirt adult`
- `kids earrings 10`
- `headphones`

Sidebar filters on `/products`: category, price range, in-stock. Gender/type/age are driven through search.

## Product Attributes

Suppliers can set optional fields on products:

- **Product type** — apparel (`shirt`, `pants`, …) and jewellery (`ring`, `necklace`, `bracelet`, …)
- **Gender** — male, female, unisex, boys, girls
- **Age range** — `minAge` / `maxAge` (used by search and API `age` filter)

## Shop Location

- Applicants enter **shop location / business address** on **Become a Supplier**
- Admins review the address on supplier applications
- On approval, the address is saved to the supplier profile (`businessAddress`)
- Suppliers can update it under **Supplier portal → Store Profile**
- Product detail pages show **Shop location** when an address exists

## Seed Data

`npm run seed` (from `backend/`) creates idempotent demo data:

- 1 admin, 3 approved suppliers (with sample shop addresses), 3 customers
- 6 categories (including Fashion & Accessories and Jewellery)
- 30 products (with gender/type/age on fashion and jewellery samples)
- Sample orders and 6 FAQs (category-based, no display order field)
- 2 pending and 1 rejected supplier application

## Key Flows

1. **Guest → Browse** — Public catalog, header search, category/price filters
2. **Customer → Checkout** — Multi-supplier cart, simulated payment
3. **Become Supplier** — Application (with shop address) → Admin review → Approval
4. **Supplier Portal** — `/supplier` only; products, orders, fulfillment, earnings, profile
5. **Admin Portal** — Applications (with location), suppliers, customers, orders, FAQ

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with role-based authorization
- Rate limiting on auth routes
- Helmet + CORS configured
- Backend validates prices, stock, and ownership — never trusts frontend values
