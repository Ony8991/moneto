# Moneto — CLAUDE.md

## Présentation

Application fullstack de gestion de dépenses personnelles. Stack : Next.js 16 (App Router), React 19, MongoDB/Mongoose, JWT (httpOnly cookies), Zod, Tailwind CSS v4.

## Architecture

```
app/
  api/auth/login/route.ts         POST  — authentification, pose un cookie httpOnly
  api/auth/register/route.ts      POST  — inscription, pose un cookie httpOnly
  api/auth/logout/route.ts        POST  — déconnexion, efface le cookie
  api/auth/me/route.ts            GET   — retourne l'utilisateur courant (vérifie cookie)
  api/expenses/route.ts           GET, POST — liste (avec filtres) et création de dépenses
  api/expenses/[id]/route.ts      PUT, DELETE — modification et suppression
  dashboard/page.tsx              Page principale (protégée)
  login/page.tsx
  register/page.tsx
  layout.tsx                      Root layout, monte AuthProvider

components/
  AddExpenseForm.tsx              Formulaire d'ajout (exporte aussi CATEGORIES)
  ExpenseList.tsx                 Liste avec édition inline
  ConfirmDialog.tsx               Dialog de confirmation (suppression)
  Toast.tsx                       Notifications

context/
  AuthContext.tsx                 État auth global (user, login, logout, register) — plus de token exposé

hooks/
  useExpenses.ts                  Gestion d'état des dépenses + CRUD (expenses, loading, total)

lib/
  auth.ts                         verifyToken() async — vérifie le JWT depuis le cookie httpOnly
  mongodb.ts                      connectDB() — connexion Mongoose singleton
  rate-limit.ts                   checkRateLimit() — rate limiting en mémoire pour /api/auth/login
  services/auth.service.ts        Logique métier auth (register, login)
  services/expense.service.ts     Logique métier dépenses (CRUD + vérification ownership + filtres)
  validators/auth.validator.ts    Schémas Zod pour register/login
  validators/expense.validator.ts Schémas Zod pour create/update expense

models/
  User.ts                         Mongoose schema — hash bcrypt en pre-save hook
  Expense.ts                      Mongoose schema — amount, category, description, date, userId

types/
  expense.ts                      Types partagés : Expense, ExpenseFilters
```

## Flux de données

```
Page (dashboard) → useExpenses hook → fetch /api/expenses
                                            ↓
                                     verifyToken()          ← JWT dans cookie httpOnly (auto-envoyé)
                                            ↓
                                     expense.service.ts     ← vérifie ownership userId + filtres
                                            ↓
                                     Mongoose / MongoDB
```

## Auth (cookies httpOnly)

- Le JWT vit dans un cookie `httpOnly` — inaccessible au JS client, protégé XSS.
- `AuthContext` ne stocke plus le token. Au montage, il appelle `/api/auth/me` pour hydrater l'état.
- `useExpenses` n'a plus besoin de passer le token — le navigateur envoie le cookie automatiquement.
- Déconnexion : `POST /api/auth/logout` efface le cookie côté serveur.

## Variables d'environnement

| Variable      | Description                        | Requis |
|---------------|------------------------------------|--------|
| MONGODB_URI   | URI de connexion MongoDB           | Oui    |
| JWT_SECRET    | Secret de signature des tokens JWT | Oui    |

Les deux variables lèvent une erreur au démarrage si absentes (pas de valeur par défaut).

## Filtres des dépenses

`GET /api/expenses` accepte les query params :
- `?category=Alimentation` — filtre par catégorie
- `?month=2026-04` — filtre par mois (format YYYY-MM)

## Catégories

`Alimentation`, `Transport`, `Loisirs`, `Santé`, `Logement`, `Vêtements`, `Autre`  
Définies dans `components/AddExpenseForm.tsx` (export nommé `CATEGORIES`).

## Conventions

- Les routes API appellent toujours `await verifyToken()` en premier (async, lit le cookie).
- Les services vérifient l'ownership (`expense.userId === userId`) avant delete/update.
- La validation Zod se fait côté serveur dans les routes API via `.safeParse()`.
- `useExpenses` gère son propre state (expenses, loading, total) et se re-fetch sur changement de filtres.
- `description` est obligatoire côté client et côté serveur (Zod + form).

## Points de vigilance

- Rate limiting sur `/api/auth/login` : 5 tentatives / 15 min par IP (en mémoire, non persisté).
- En multi-instance ou serverless, migrer le rate limiting vers Redis.
- `JWT_SECRET` ne doit jamais avoir de valeur par défaut — l'app refuse de démarrer sans lui.

## Commandes

```bash
npm run dev      # Démarrer en développement
npm run build    # Build production
npm run lint     # Linter ESLint
```
