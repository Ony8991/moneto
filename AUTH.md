# Authentication API Documentation

## Configuration requise

Ajoute une variable d'environnement dans `.env.local`:
```
JWT_SECRET=your-super-secret-key-change-this-in-production
```

## Endpoints d'Authentification

### 1. Register (Créer un compte)

**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Jean Dupont"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Jean Dupont"
  }
}
```

---

### 2. Login (Se connecter)

**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Jean Dupont"
  }
}
```

---

## Endpoints d'Expenses (Protégés)

Tous les endpoints d'expenses nécessitent un header `Authorization`:

```
Authorization: Bearer <token>
```

### 1. Récupérer toutes les dépenses

**GET** `/api/expenses`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
[
  {
    "_id": "expense_id",
    "userId": "user_id",
    "amount": 25.50,
    "category": "Alimentation",
    "description": "Courses Lidl",
    "date": "2025-04-28T12:00:00Z"
  }
]
```

---

### 2. Créer une dépense

**POST** `/api/expenses`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 25.50,
  "category": "Alimentation",
  "description": "Courses Lidl"
}
```

**Response (201):**
```json
{
  "_id": "expense_id",
  "userId": "user_id",
  "amount": 25.50,
  "category": "Alimentation",
  "description": "Courses Lidl",
  "date": "2025-04-28T12:00:00Z"
}
```

---

### 3. Modifier une dépense

**PUT** `/api/expenses/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 30.00,
  "category": "Courses"
}
```

---

### 4. Supprimer une dépense

**DELETE** `/api/expenses/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exemple d'utilisation avec PowerShell

### Register
```powershell
$body = @{
  email = "user@example.com"
  password = "password123"
  name = "Jean Dupont"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Login
```powershell
$body = @{
  email = "user@example.com"
  password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$token = ($response.Content | ConvertFrom-Json).token
```

### Créer une dépense avec Token
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

$body = @{
  amount = 25.50
  category = "Alimentation"
  description = "Courses Lidl"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/expenses" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body
```

---

## Comportements de sécurité

✅ **Protections implémentées:**
- Token JWT avec expiration 7 jours
- Hachage bcrypt des mots de passe (10 salts)
- Vérification que l'utilisateur possède la dépense (403 Forbidden)
- Email unique par utilisateur
- Validation des données (password min 6 caractères)

⚠️ **À faire en production:**
- Utiliser une variable `JWT_SECRET` forte (>32 caractères)
- Ajouter HTTPS
- Implémenter le refresh token
- Ajouter un rate limiting
- Ajouter la vérification d'email
