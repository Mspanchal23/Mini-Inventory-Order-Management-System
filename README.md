# Mini Inventory & Order Management System

A MERN stack web application where an admin manages **products**, **stock** and **customer orders**.
Stock is reduced when an order is confirmed and restored when a confirmed order is cancelled. The tricky
cases (race conditions, duplicate lines, price changes, deleted products) are handled on the server.

![Dashboard](docs/screenshots/dashboard.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database / Models](#database--models)
- [Tricky Logic Implemented](#tricky-logic-implemented)
- [Screenshots](#screenshots)
- [Deployment (Vercel)](#deployment-vercel)
- [Design Decisions & Notes](#design-decisions--notes)

---

## Features

**Products**
- Add, edit, delete (soft delete) and list products
- Search by name / SKU / category, filter by category and status, sort by any column, server-side pagination
- Fields: name, SKU (unique, auto upper-cased), price, stock, category, status (Active / Inactive), description, created / updated dates
- Stock level highlighting (low / out of stock)

**Orders**
- Create an order for a customer: pick an existing customer (search) or enter a new one (name, phone, email, address)
- Add multiple products with quantities; live line totals and order total
- Status flow: **Pending → Confirmed**, **Pending → Cancelled**, **Confirmed → Cancelled**
- Edit pending orders; view order list (search, status filter, sort, pagination) and order details

**Dashboard**
- Total products, total orders (with per-status counts), total stock, total sales (confirmed orders)
- Recent orders and low-stock products

**Quality**
- REST API with consistent JSON responses and proper HTTP status codes
- Joi request validation + Mongoose schema validation
- Rate limiting on every API route (stricter for write requests)
- Helmet security headers, CORS restricted to the client URL
- Reusable React components and hooks, URL-synced list filters, responsive layout (mobile drawer)

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Database | MongoDB + Mongoose |
| Backend  | Node.js, Express 5, Joi, express-rate-limit, Helmet, Morgan |
| Frontend | React 19 (Vite), Material UI (MUI), React Router, Axios |

---

## Project Structure

```
.
├── server/                     # REST API
│   ├── .env.example
│   └── src/
│       ├── config/             # env loading, DB connection
│       ├── models/             # Product, Customer, Order, Counter
│       ├── validators/         # Joi schemas (body / query / params)
│       ├── middleware/         # validate, rateLimiter, errorHandler
│       ├── services/           # business logic (stock, orders, products, dashboard)
│       ├── controllers/        # thin HTTP layer, call services
│       ├── routes/             # route definitions
│       ├── utils/              # ApiError, response + money helpers
│       ├── app.js              # express app
│       ├── server.js           # entry point
│       └── seed.js             # sample data
│
├── client/                     # React app
│   ├── .env.example
│   └── src/
│       ├── api/                # axios client + API modules
│       ├── components/
│       │   ├── common/         # DataTable, PageHeader, SearchField, FilterSelect, FilterBar,
│       │   │                   # FormDialog, StatusChip, StatCard, SectionCard, InfoList, StateViews
│       │   ├── products/       # ProductFormDialog, StockLabel
│       │   └── orders/         # CustomerFields, ProductPicker, OrderItemsEditor, OrderSummary, OrderActions
│       ├── context/            # Notification (toasts), Confirm dialog (promise based)
│       ├── hooks/              # useFetch, useTableState, useFormState, useDebounce,
│       │                       # useAsyncOptions, useOrderActions
│       ├── layout/             # AppLayout (sidebar + top bar)
│       ├── pages/              # Dashboard, Products, Orders, OrderForm, OrderDetails, NotFound
│       └── utils/              # constants, formatters, order form helpers
│
└── docs/screenshots/
```

The backend follows **routes → validation → controller → service → model**. Controllers only handle HTTP;
all business rules live in services, so they can be reused (e.g. the seed script uses the same order service).

---

## Getting Started

### Prerequisites

- Node.js **18+** (developed on Node 22)
- MongoDB **6+** running locally, or a MongoDB Atlas connection string

### 1. Clone

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit MONGO_URI if needed
npm run seed                # optional: loads sample products, customers and orders
npm run dev                 # starts API on http://localhost:5000
```

> `npm run seed` **clears** the products, customers and orders collections before inserting sample data.

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev                 # opens http://localhost:5173
```

### Available scripts

| Location | Script          | Description |
|----------|-----------------|-------------|
| server   | `npm run dev`   | Start API with auto reload (nodemon) |
| server   | `npm start`     | Start API (production) |
| server   | `npm run seed`  | Reset DB with sample data |
| client   | `npm run dev`   | Start Vite dev server |
| client   | `npm run build` | Production build to `client/dist` |
| client   | `npm run lint`  | Lint with oxlint |

---

## Environment Variables

### `server/.env`

| Variable               | Default                                   | Description |
|------------------------|-------------------------------------------|-------------|
| `NODE_ENV`             | `development`                             | `production` hides stack traces and request logs |
| `PORT`                 | `5000`                                    | API port |
| `MONGO_URI`            | `mongodb://127.0.0.1:27017/inventory_db`  | MongoDB connection string (**required**) |
| `CLIENT_URL`           | `http://localhost:5173`                   | Allowed CORS origin(s), comma separated |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min)                         | Rate limit window |
| `RATE_LIMIT_MAX`       | `300`                                     | Max requests per IP per window (all routes) |
| `RATE_LIMIT_WRITE_MAX` | `60`                                      | Max POST/PUT/PATCH/DELETE per IP per window |
| `LOW_STOCK_THRESHOLD`  | `5`                                       | Stock at or below this is "low stock" on the dashboard |

### `client/.env`

| Variable        | Default                     | Description |
|-----------------|-----------------------------|-------------|
| `VITE_API_URL`  | `http://localhost:5000/api` | Backend base URL |
| `VITE_CURRENCY` | `INR`                       | Currency code for price formatting |
| `VITE_LOCALE`   | `en-IN`                     | Locale for number / date formatting |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Postman collection

Import [`server/Inventory-API.postman_collection.json`](server/Inventory-API.postman_collection.json) into Postman.
It has requests for every endpoint and a **Tricky cases** folder (cancel twice, edit confirmed order,
over-stock, negative quantity, duplicate SKU, price change, soft delete) with test assertions.
Ids are saved into collection variables automatically, so you can use **Run collection** (start the server first).
The `baseUrl` collection variable defaults to `http://localhost:5000/api`.

Command line alternative: `npx newman run server/Inventory-API.postman_collection.json`

### Response format

```jsonc
// Success
{ "success": true, "message": "Order created", "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }

// Error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "items.0.quantity", "message": "Quantity must be at least 1" }] }
```

### Status codes

| Code  | When |
|-------|------|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error, invalid id, malformed JSON, invalid status change (e.g. cancel a cancelled order) |
| `404` | Product / order / route not found |
| `409` | Duplicate SKU, not enough stock, order currently being processed |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

### Products

| Method   | Endpoint                   | Description |
|----------|----------------------------|-------------|
| `GET`    | `/products`                | List products. Query: `page`, `limit` (max 100), `search`, `category`, `status`, `sortBy` (`name`, `sku`, `price`, `stock`, `category`, `createdAt`, `updatedAt`), `order` (`asc`/`desc`) |
| `GET`    | `/products/categories`     | Distinct categories |
| `GET`    | `/products/:id`            | Product details |
| `POST`   | `/products`                | Create product |
| `PUT`    | `/products/:id`            | Update product (any subset of fields) |
| `DELETE` | `/products/:id`            | Soft delete product |

```json
POST /products
{ "name": "Wireless Mouse", "sku": "ELEC-MOU-001", "price": 799, "stock": 45, "category": "Electronics", "status": "Active", "description": "" }
```

### Orders

| Method  | Endpoint               | Description |
|---------|------------------------|-------------|
| `GET`   | `/orders`              | List orders. Query: `page`, `limit`, `search` (order no. / customer name), `status`, `sortBy` (`createdAt`, `totalAmount`, `orderNo`, `status`), `order` |
| `GET`   | `/orders/:id`          | Order details (items include current product state) |
| `POST`  | `/orders`              | Create order (status **Pending**) |
| `PUT`   | `/orders/:id`          | Edit order — **Pending only** |
| `PATCH` | `/orders/:id/confirm`  | Pending → Confirmed, deducts stock |
| `PATCH` | `/orders/:id/cancel`   | Pending/Confirmed → Cancelled, restores stock if it was confirmed |

```json
POST /orders
{
  "customer": { "id": "optional-existing-customer-id", "name": "Aarav Shah", "phone": "+91 98765 43210", "email": "aarav@example.com", "address": "12 MG Road, Ahmedabad" },
  "items": [
    { "product": "665f1c...", "quantity": 2 },
    { "product": "665f1d...", "quantity": 1 }
  ],
  "notes": "Deliver after 5 PM"
}
```

The client never sends prices or totals; the server calculates them from the database.

### Customers & Dashboard

| Method | Endpoint            | Description |
|--------|---------------------|-------------|
| `GET`  | `/customers`        | Search customers. Query: `search` (name / phone / email), `limit` |
| `GET`  | `/dashboard/stats`  | Totals, orders by status, recent orders, low stock products |
| `GET`  | `/health`           | Health check |

---

## Database / Models

```
Customer 1 ──── * Order * ──── * Product
                  │
                  └─ items[] (embedded snapshot: product ref, name, sku, unitPrice, quantity, lineTotal)
```

### Product

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required, max 120 |
| `sku` | String | required, upper-cased, **unique among non-deleted products** (partial unique index) |
| `price` | Number | required, ≥ 0 |
| `stock` | Number | required, integer, ≥ 0 |
| `category` | String | required |
| `status` | `Active` \| `Inactive` | inactive products cannot be ordered |
| `description` | String | optional |
| `isDeleted`, `deletedAt` | Boolean, Date | soft delete |
| `createdAt`, `updatedAt` | Date | timestamps |

### Customer

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | required |
| `phone`, `email` | String | optional |
| `address` | String | required |

### Order

| Field | Type | Notes |
|-------|------|-------|
| `orderNo` | String | unique, human readable (`ORD-00001`) from an atomic counter |
| `customer` | ObjectId → Customer | reference |
| `customerSnapshot` | Object | name, phone, email, address at order time |
| `items[]` | Array | `product` (ref), `name`, `sku`, `unitPrice`, `quantity`, `lineTotal` — **snapshot** |
| `totalAmount` | Number | calculated by server |
| `status` | `Pending` \| `Confirmed` \| `Cancelled` | |
| `isProcessing` | Boolean | short-lived lock while a confirm is running (hidden from responses) |
| `confirmedAt`, `cancelledAt` | Date | |
| `notes` | String | optional |

### Counter

Stores sequences (`{ _id: 'order', seq }`) incremented atomically with `$inc` to generate order numbers.

**Why references + snapshots?** References keep relationships (which customer, which product), while
snapshots freeze what was actually sold. An order stays correct even if the product is renamed, re-priced or
deleted, or the customer changes their address later.

---

## Tricky Logic Implemented

| Case | How it is handled |
|------|-------------------|
| **Two users order the last available stock** | Stock is deducted with one atomic conditional update per item: `updateOne({ _id, stock: { $gte: qty }, isDeleted: false, status: 'Active' }, { $inc: { stock: -qty } })`. MongoDB applies single-document updates atomically, so only one request can match when one unit is left; the other gets **409** *"Insufficient stock… Available: 0"*. Deduction is all-or-nothing: if any line fails, lines already deducted are rolled back. |
| **Same order confirmed twice at the same time** | Before touching stock, the order is locked with an atomic `findOneAndUpdate({ _id, status: 'Pending', isProcessing: { $ne: true } }, { isProcessing: true })`. Concurrent requests get **409** (*being processed*) or **400** (*already confirmed*). Stock is deducted exactly once. |
| **Same product added multiple times in one order** | The server merges lines by product and sums the quantities before validating stock and pricing (`[A×2, A×3]` → `A×5`). The UI also merges the lines and shows a notice. |
| **Product deleted after it was used in an order** | Products are **soft deleted**. Orders keep their item snapshot, so details and totals are unchanged; the details page marks the item as *Deleted*. A pending order with a deleted product cannot be confirmed (409). The SKU of a deleted product can be reused. |
| **Cancelled order is cancelled again** | Cancel uses a guarded update that only matches `status ∈ {Pending, Confirmed}`. A second cancel (even concurrent) matches nothing and returns **400** *"Order is already cancelled"*, so stock is never restored twice. |
| **Confirmed order is edited** | Only **Pending** orders can be edited (checked again atomically at write time). Editing a confirmed or cancelled order returns **400** with a hint to cancel and create a new order. The UI hides the Edit action. |
| **Product price changes after order is created** | Each line stores `unitPrice` and `lineTotal`, and the order stores `totalAmount`, at creation time. Changing a product price never touches existing orders. Editing a *pending* order re-prices it at current prices (it has not been confirmed yet). |
| **Order total stays correct** | Totals are always computed on the server from DB prices (the client never sends prices) and rounded to 2 decimals to avoid floating point drift. Dashboard sales sum the stored `totalAmount` of confirmed orders. |
| **Invalid / negative quantity** | Rejected in three layers: UI validation, Joi (`integer`, `min 1`) → **400** with a field-level message, and Mongoose schema validation. |
| **Duplicate SKU** | SKUs are trimmed and upper-cased, checked before saving (**409** with a field error), and enforced by a partial unique index, which also catches a race between two simultaneous creates. |
| **Ordering more than available stock** | Checked when an order is created / edited (early feedback, **409** per item) and enforced atomically at confirmation time, because stock may change between creating and confirming. |

### Status transitions

```
            confirm (deduct stock)
 Pending ─────────────────────────▶ Confirmed
    │                                   │
    │ cancel (no stock change)          │ cancel (restore stock)
    ▼                                   ▼
 Cancelled ◀────────────────────────────┘
```

Any other transition (confirm a cancelled order, cancel twice, edit a confirmed order) returns **400**.

---

## Screenshots

| | |
|---|---|
| **Dashboard** ![Dashboard](docs/screenshots/dashboard.png) | **Products** ![Products](docs/screenshots/products.png) |
| **Product form validation** ![Product form](docs/screenshots/product-form-validation.png) | **Orders** ![Orders](docs/screenshots/orders.png) |
| **New order** (duplicate product merged) ![New order](docs/screenshots/order-form.png) | **Order validation** (stock limit) ![Order validation](docs/screenshots/order-form-validation.png) |
| **Order details** ![Order details](docs/screenshots/order-details.png) | **Mobile** ![Mobile](docs/screenshots/mobile-dashboard.png) |

---

## Deployment (Vercel)

The repository deploys as **one Vercel project with two services**, configured in [`vercel.json`](vercel.json):

| Path      | Service  | Notes |
|-----------|----------|-------|
| `/api/*`  | `server` | Express app (`server/src/app.js`) running as a Vercel Function |
| `/*`      | `client` | Vite build; unknown paths fall back to `index.html` so deep links like `/orders/:id` work |

Both run on the same domain, so the frontend calls the API at `/api` and no CORS setup is needed.

**Steps**

1. Create a MongoDB Atlas cluster (free tier is fine). Add a database user, and under **Network Access** allow `0.0.0.0/0`, because Vercel does not use fixed IPs.
2. Import the GitHub repository in Vercel. It detects `vercel.json` automatically.
3. Under **Project → Settings → Environment Variables**, add:

   | Variable       | Value |
   |----------------|-------|
   | `MONGO_URI`    | Atlas connection string, e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/inventory_db` |
   | `NODE_ENV`     | `production` |
   | `CLIENT_URL`   | the deployed URL, e.g. `https://your-app.vercel.app` |
   | `VITE_API_URL` | optional. Production builds default to `/api` |

4. Deploy. To load sample data, run `npm run seed` locally with `MONGO_URI` temporarily pointing to Atlas.

On Vercel, `src/server.js` does not run. The app connects to MongoDB on the first API request and reuses that
connection for later requests (`server/src/config/db.js`). If the database cannot be reached, the API returns `503`.

---

## Design Decisions & Notes

- **No MongoDB transactions required.** Transactions need a replica set, which a default local MongoDB
  install does not have. The stock logic uses atomic single-document updates with compensation (rollback)
  instead, so it works on both standalone MongoDB and Atlas.
- **Stock is deducted on confirm, not on create.** Pending orders do not reserve stock; availability is
  re-checked atomically at confirmation.
- **Customers** are stored in their own collection. In the order form, choosing an existing customer reuses
  that record (and refreshes their contact details); typing a new name creates a new customer.
- **Authentication** is out of scope for this task (single admin, no login).
- **Rate limiting** is per IP and stored in memory (per instance on Vercel); for multiple instances a shared store (e.g. Redis)
  would be used.
- **Known limitation:** if the server process crashes in the middle of confirming an order, the order's
  `isProcessing` lock would need to be cleared manually. In production this would be handled with a lock
  timeout or a MongoDB transaction on a replica set.
