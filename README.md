# Expense Tracker

A personal expense tracking application built with Flask (Python) and React (TypeScript).

## Architecture

```
backend/          Flask REST API + SQLite
  app/
    models.py     SQLAlchemy models (Category, Expense)
    schemas.py    Marshmallow schemas for validation
    errors.py     Centralized error handlers
    extensions.py Flask extension instances
    routes/
      categories.py   /api/categories CRUD
      expenses.py     /api/expenses CRUD + summary
  tests/            pytest test suite
  config.py         App configuration
  run.py            Entry point

frontend/         React + TypeScript + Vite
  src/
    api/client.ts       Typed API client
    types.ts            Shared TypeScript interfaces
    components/
      CategoryManager   Category CRUD
      ExpenseForm       Add/edit expense form
      ExpenseList       Paginated expense table
      Summary           Spending breakdown
```

## Key Technical Decisions

### 1. SQLite as the database
Chosen for zero-config setup and portability. The schema (two tables with a foreign key) is simple enough that SQLite handles it well. For production, swap to PostgreSQL via the `DATABASE_URL` env var — no code changes required.

### 2. Marshmallow for request validation
All incoming data is validated through Marshmallow schemas before touching the database. This prevents invalid states (negative amounts, blank descriptions, nonexistent category references) at the API boundary. Validation errors return structured JSON with field-level details.

### 3. Blueprints for route organization
Each resource (categories, expenses) lives in its own Blueprint. Adding a new resource means adding a new file and registering it — existing code stays untouched.

### 4. TypeScript with strict mode
The frontend uses `strict: true` and `noUncheckedIndexedAccess` to catch type errors at compile time. The `types.ts` file is the single source of truth for API response shapes.

### 5. Vite proxy for development
The Vite dev server proxies `/api/*` to Flask, avoiding CORS issues during development while keeping the frontend and backend completely decoupled.

### 6. Pagination
Expenses are paginated server-side to keep response sizes bounded as data grows.

## Tradeoffs & Weaknesses

- **No authentication**: This is a single-user app. Adding auth would require a User model, JWT/session middleware, and per-user data scoping.
- **No currency handling**: Amounts are stored as floats. A production app should use decimal types to avoid floating-point rounding.
- **SQLite concurrency**: SQLite doesn't handle concurrent writes well. Fine for a personal tool, but a multi-user deployment needs PostgreSQL.
- **No end-to-end tests**: The backend has unit/integration tests. The frontend relies on type safety but lacks component tests (would add React Testing Library).

## How to Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python run.py
```

API runs at http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000

### Run Tests

```bash
cd backend
pytest -v
```
