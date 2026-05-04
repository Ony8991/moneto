# Moneto — Personal Expense Manager

A full-stack web application for tracking personal expenses, built with Next.js 16, React 19, MongoDB, and Tailwind CSS. Installable as a PWA on mobile.

---

## Features

- **Authentication** — Register and log in with email and password. Session managed via a secure `httpOnly` cookie (JWT).
- **Expense management** — Add, edit, and delete expenses with amount, category, description, and date.
- **Recurring expenses** — Define monthly templates (rent, subscriptions...) that are automatically generated each month on dashboard load.
- **Monthly budgets** — Set a spending limit per category and track progress with a progress bar.
- **Charts** — Pie chart by category and bar chart for the last 12 months.
- **Filters** — Filter expenses by category, month, or free-text search (description or category).
- **Multi-currency** — Switch between EUR, MUR (Mauritian Rupee), and MGA (Malagasy Ariary). All amounts are stored in EUR internally.
- **Dark mode** — Toggle between light and dark theme, persisted in `localStorage`.
- **PWA** — Installable on Android and iOS. Works offline for previously visited pages.
- **Number formatting** — Thousands separator for readability (e.g. `3 123.45`).
- **Rate limiting** — Login endpoint is protected: 5 attempts max per 15 minutes per IP.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | MongoDB via Mongoose |
| Auth | JWT stored in `httpOnly` cookie |
| Validation | Zod |
| Charts | Recharts |
| Language | TypeScript |
| Deployment | Vercel |

---

## Project Structure

```
moneto/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       POST  — authenticate, set httpOnly cookie
│   │   │   ├── register/route.ts    POST  — create account, set httpOnly cookie
│   │   │   ├── logout/route.ts      POST  — clear cookie
│   │   │   └── me/route.ts          GET   — return current user from cookie
│   │   ├── expenses/
│   │   │   ├── route.ts             GET, POST  — list (with filters) and create
│   │   │   ├── [id]/route.ts        PUT, DELETE — update and delete
│   │   │   └── monthly/route.ts     GET   — aggregated totals for last 12 months
│   │   ├── budgets/route.ts         GET, PUT — read and save monthly budgets
│   │   └── recurring/
│   │       ├── route.ts             GET, POST — list and create recurring templates
│   │       ├── [id]/route.ts        DELETE — remove a template
│   │       └── apply/route.ts       POST  — generate this month's expenses from templates
│   ├── dashboard/page.tsx           Main page (protected)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx                   Root layout — mounts all providers
│   ├── manifest.ts                  PWA manifest
│   ├── icon.tsx                     Favicon (32x32, generated dynamically)
│   └── apple-icon.tsx               iOS icon (180x180, generated dynamically)
│
├── components/
│   ├── AddExpenseForm.tsx           Add expense form (also exports CATEGORIES)
│   ├── ExpenseList.tsx              List with inline editing
│   ├── BudgetSection.tsx            Monthly budget with progress bars
│   ├── RecurringSection.tsx         Recurring expense templates UI
│   ├── ExpenseChart.tsx             Pie chart by category
│   ├── MonthlyChart.tsx             Bar chart for last 12 months
│   ├── ConfirmDialog.tsx            Delete confirmation dialog
│   ├── Toast.tsx                    Notifications (success / error)
│   └── PwaInit.tsx                  Service worker registration
│
├── context/
│   ├── AuthContext.tsx              Global auth state (user, login, logout, register)
│   ├── CurrencyContext.tsx          Currency state + EUR conversion helpers
│   └── ThemeContext.tsx             Dark/light theme toggle
│
├── hooks/
│   ├── useExpenses.ts               Expenses state + CRUD + reload
│   ├── useRecurring.ts              Recurring templates state + add/remove
│   ├── useBudgets.ts                Budget state + save
│   └── useMonthlyStats.ts           Monthly aggregated data for chart
│
├── lib/
│   ├── auth.ts                      verifyToken() — reads and verifies JWT from cookie
│   ├── mongodb.ts                   connectDB() — singleton Mongoose connection
│   ├── format.ts                    formatAmount() — thousands separator formatting
│   ├── rate-limit.ts                checkRateLimit() — in-memory rate limiter
│   ├── services/
│   │   ├── auth.service.ts          register / login business logic
│   │   ├── expense.service.ts       expense CRUD + ownership check + filters
│   │   └── recurring.service.ts     recurring templates CRUD + monthly apply logic
│   └── validators/
│       ├── auth.validator.ts        Zod schemas for register/login
│       ├── expense.validator.ts     Zod schemas for create/update expense
│       └── recurring.validator.ts   Zod schema for create recurring expense
│
├── models/
│   ├── User.ts                      Mongoose schema — bcrypt hash in pre-save hook
│   ├── Expense.ts                   amount, category, description, date, userId,
│   │                                recurringId (optional), generatedMonth (optional)
│   ├── RecurringExpense.ts          amount, category, description, dayOfMonth, userId
│   └── Budget.ts                    userId (unique), categories object { category: amountEUR }
│
├── types/
│   └── expense.ts                   Shared types: Expense, ExpenseFilters
│
└── public/
    ├── sw.js                        Service worker (cache-first for static assets)
    └── icon.svg                     SVG app icon
```

---

## Data Flow

```
Browser → dashboard page
            ↓
        useExpenses / useRecurring / useBudgets hooks
            ↓
        fetch /api/expenses  (GET with ?category= &month=)
            ↓
        verifyToken()        ← reads JWT from httpOnly cookie (sent automatically)
            ↓
        expense.service.ts   ← checks userId ownership + applies filters
            ↓
        Mongoose → MongoDB
```

---

## Authentication

- The JWT lives in an `httpOnly` cookie — inaccessible to client-side JavaScript, protected against XSS attacks.
- `AuthContext` does not store the token. On mount it calls `GET /api/auth/me` to hydrate the user state.
- All API routes call `await verifyToken()` first — if null, return 401.
- Logout calls `POST /api/auth/logout` which clears the cookie server-side.

---

## Recurring Expenses Logic

When the dashboard loads, it calls `POST /api/recurring/apply`. The service:

1. Gets all recurring templates for the user.
2. Computes the current month string (`"YYYY-MM"`).
3. For each template, checks if an `Expense` with `recurringId = template._id` AND `generatedMonth = currentMonth` already exists.
4. If not — creates the expense with the day of the month specified in the template (capped at 28 to handle February).
5. Returns `{ created: N }`. If `N > 0`, the dashboard reloads the expense list.

This ensures expenses are generated **at most once per month per template**, with no duplicates regardless of how many times the dashboard is opened.

---

## Currency System

All amounts are **stored in EUR** in the database. The `CurrencyContext` provides two helpers:

- `fromEUR(amount)` — converts a stored EUR amount to the selected display currency.
- `toEUR(amount)` — converts a user-entered amount back to EUR before saving.

Exchange rates are hardcoded in `context/CurrencyContext.tsx` and should be updated periodically. The selected currency is persisted in `localStorage`.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Log in, set cookie | No |
| POST | `/api/auth/logout` | Clear cookie | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Expenses

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/api/expenses` | List expenses (filters: `?category=` `?month=YYYY-MM`) | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| PUT | `/api/expenses/[id]` | Update expense | Yes |
| DELETE | `/api/expenses/[id]` | Delete expense | Yes |
| GET | `/api/expenses/monthly` | Last 12 months aggregated totals | Yes |

### Budgets

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/api/budgets` | Get budget per category | Yes |
| PUT | `/api/budgets` | Save budget per category | Yes |

### Recurring Expenses

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/api/recurring` | List recurring templates | Yes |
| POST | `/api/recurring` | Create recurring template | Yes |
| DELETE | `/api/recurring/[id]` | Delete recurring template | Yes |
| POST | `/api/recurring/apply` | Generate this month's expenses | Yes |

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=a_long_random_secret_string
```

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection URI (Atlas or local) | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

The app refuses to start if either variable is missing — there are no default values.

---

## Installation (local)

**Prerequisites:** Node.js 18+ and a MongoDB database (Atlas or local).

```bash
# Clone the repository
git clone https://github.com/Ony8991/moneto.git
cd moneto

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in MONGODB_URI and JWT_SECRET

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy. Vercel detects Next.js automatically.

---

## PWA — Install on Mobile

The app is a Progressive Web App and can be installed on mobile devices.

**Android (Chrome):**
1. Open the app URL in Chrome.
2. A banner "Add to Home screen" appears automatically at the bottom.
3. If not: tap the 3-dot menu → "Add to Home screen".

**iOS (Safari):**
1. Open the app URL in Safari.
2. Tap the Share button.
3. Tap "Add to Home Screen".

Once installed, the app opens full-screen without a browser address bar, like a native app.

The service worker (`public/sw.js`) caches static pages for offline access. API calls always require an internet connection since data is stored in MongoDB.

---

## Security

| Mechanism | Details |
|---|---|
| JWT in `httpOnly` cookie | Token is inaccessible to JavaScript — XSS-proof |
| Bcrypt password hashing | Applied in Mongoose pre-save hook on the User model |
| Ownership checks | Every PUT/DELETE verifies `expense.userId === authenticatedUserId` |
| Zod validation | All API inputs are validated server-side before processing |
| Rate limiting | Login: 5 attempts per 15 minutes per IP (in-memory) |

> **Note:** The in-memory rate limiter resets on server restart and does not work across multiple instances. For production at scale, replace it with a Redis-based solution.

---

## Categories

`Food` · `Transport` · `Entertainment` · `Health` · `Housing` · `Clothing` · `Other`

Defined and exported from `components/AddExpenseForm.tsx` as `CATEGORIES`.
