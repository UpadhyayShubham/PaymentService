# 💸 Payment Service

A payment service built with **TypeScript**, **Express** and **PostgreSQL**.
The payment flow is the centerpiece of the exercise.

---

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Architecture](#-architecture)
- [Data Model](#-data-model)
- [API](#-api)
- [Payment Flow](#-payment-flow)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)

---

## 🎯 Requirements

| Area | Scope |
|---|---|
| **Data modelling** | Employees, Accounts, Jobs, Payments |
| **APIs** | Pay a job · Get account balance · Get payment / job status |
| **Focus** | Make the payment flow the centerpiece of the exercise |

---

## 🏗️ Architecture

```
HTTP  ──▶  Controller  ──▶  Service  ──▶  Repository  ──▶  DB
```

| Layer | Responsibility | Location |
|---|---|---|
| **Controller** | Parse requests, map errors to HTTP status codes | `src/controllers/` |
| **Service** | Business rules for paying a job | `src/services/` |
| **Repository** | SQL access to Postgres | `src/repositories/` |
| **DB** | Pool, transactions, migrations, seed data | `src/db/` |

---

## 🗄️ Data Model

```
employees 1 ── 1 accounts
    │               │
    1               1
    │               │
    * jobs 1 ── 1 payments
```

| Table | Key columns | Constraints |
|---|---|---|
| `employees` | `id`, `name`, `email` | `email` unique |
| `accounts` | `id`, `employee_id`, `balance` | one account per employee, `balance >= 0` |
| `jobs` | `id`, `employee_id`, `description`, `amount`, `status` | `amount > 0`, status: `pending` · `paid` · `cancelled` |
| `payments` | `id`, `job_id`, `account_id`, `amount`, `status` | one payment per job, status: `pending` · `completed` · `failed` |

> Amounts are stored as `BIGINT`. Schema: `src/db/migrations/001_initial_schema.sql`

---

## 🔌 API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/payments` | Pay a job |
| `GET` | `/accounts/:id/balance` | Get account balance |
| `GET` | `/jobs/:jobId/payment` | Get payment / job status |

### Pay a job

```http
POST /payments
Content-Type: application/json

{ "jobId": "<job-uuid>" }
```

**`201 Created`**

```json
{
  "id": "<payment-uuid>",
  "jobId": "<job-uuid>",
  "accountId": "<account-uuid>",
  "amount": "1000",
  "status": "...",
  "createdAt": "..."
}
```

**Errors**

| Status | Code | When |
|---|---|---|
| `400` | — | `jobId` missing or not a string |
| `404` | `JOB_NOT_FOUND` | Job does not exist |
| `404` | `ACCOUNT_NOT_FOUND` | Employee has no account |
| `409` | `JOB_NOT_PAYABLE` | Job is not `pending` |
| `409` | `INSUFFICIENT_FUNDS` | Account balance is too low |
| `500` | `INTERNAL_SERVER_ERROR` | Anything unexpected |

---

## 🔄 Payment Flow

Everything runs inside **one database transaction** (unit of work), so any failure rolls back all changes.

1. **Find the job**, or fail with `JOB_NOT_FOUND`
2. **Check the job is `pending`**, or fail with `JOB_NOT_PAYABLE`
3. **Lock the employee's account** with `SELECT … FOR UPDATE`, so concurrent payments can't change the same account at once
4. **Create the payment.** The amount comes from the job, never from the request
5. **Debit the account** with a guarded update, failing with `INSUFFICIENT_FUNDS` if the balance is too low:
   ```sql
   UPDATE accounts SET balance = balance - $1
   WHERE id = $2 AND balance >= $1
   ```
6. **Mark the job as `paid`**
7. **Commit** and return the payment

> Source: `src/services/payment-service.ts`

---

## 🚀 Getting Started

**Prerequisites:** Node.js `24` (see `.nvmrc`) and PostgreSQL.

```bash
# 1. Use the right Node version
nvm use

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env   # then fill in DATABASE_PASSWORD

# 4. Run in watch mode
npm run dev
```

### Environment variables

| Variable | Example |
|---|---|
| `PORT` | `3000` |
| `DATABASE_HOST` | `localhost` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_NAME` | `payment_service` |
| `DATABASE_USER` | `payment_service_user` |
| `DATABASE_PASSWORD` | `<your-db-password>` |

---

## 🐘 Database Setup

### 1. Create DB users and grant access

```sql
REVOKE CONNECT ON DATABASE devdb FROM PUBLIC;
REVOKE CONNECT ON DATABASE payment_service FROM PUBLIC;

CREATE USER devdbuser WITH ENCRYPTED PASSWORD '<your-devdb-password>';
CREATE USER payment_service_user WITH ENCRYPTED PASSWORD '<your-db-password>';

GRANT ALL PRIVILEGES ON DATABASE devdb TO devdbuser;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO payment_service_user;
```

### 2. Verify privileges

```sql
SELECT has_database_privilege('devdbuser', 'devdb', 'CONNECT');                       -- should return t
SELECT has_database_privilege('payment_service_user', 'payment_service', 'CONNECT');  -- should return f
```

### 3. Connect

```bash
psql -U devdbuser -d devdb -h localhost
psql -U payment_service_user -d payment_service -h localhost
```

### 4. Create the schema and seed data

| File | Purpose |
|---|---|
| `src/db/migrations/001_initial_schema.sql` | Tables and indexes |
| `src/db/seed.sql` | Sample employees, accounts and jobs |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 📁 Project Structure

```
src/
├── app.ts              # Express app and routes
├── server.ts           # Entry point
├── controllers/        # HTTP layer
├── services/           # Payment logic and unit of work
├── repositories/       # Repository interfaces and Postgres implementations
├── models/             # Employee, Account, Job, Payment
├── errors/             # App and payment errors
└── db/                 # Pool, transactions, migrations, seed
tests/
├── services/           # Unit tests with fakes
├── repositories/       # Repository tests
├── integration/        # Payment service and transaction tests
└── fakes/              # In-memory test doubles
```
