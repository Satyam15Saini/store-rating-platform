# Store Rating Platform

A beautiful, premium fullstack web application for registering stores and submitting user ratings (1 to 5 stars). The application features a robust ExpressJS + TypeScript + Prisma backend and a high-fidelity React + Vite + TypeScript frontend.

## Tech Stack
- **Backend**: ExpressJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Docker-compose)
- **Frontend**: ReactJS, Vite, TypeScript, Vanilla CSS (Premium Dark Theme)

---

## Getting Started

### 1. Database Setup
Ensure you have Docker running, then start the PostgreSQL container:
```bash
docker-compose up -d
```
The database will run on `localhost:5432` with credentials:
- **DB Name**: `store_rating_db`
- **Username**: `postgres`
- **Password**: `postgres_password`

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/store_rating_db?schema=public"
   JWT_SECRET="super_secret_jwt_key_12345!"
   PORT=5000
   ```
4. Run migrations to create the schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with default users and stores:
   ```bash
   npm run seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## Seeded Users for Testing & Demo

The database will be seeded with users representing each role.
> [!IMPORTANT]
> To comply with the strict validation rule (`Name: Min 20 characters, Max 60 characters`), all seeded accounts have names of at least 20 characters.

1. **System Administrator**
   - **Email**: `admin.account@example.com`
   - **Password**: `AdminSecure123!` (8+ characters, uppercase, special character)
   - **Name**: `Administrator Account Executive`

2. **Normal User**
   - **Email**: `normal.user@example.com`
   - **Password**: `UserSecure123!`
   - **Name**: `Normal User Account Holder`

3. **Store Owner & Store** (automatically generated)
   - **Email**: `starbucks.owner@example.com`
   - **Password**: `OwnerSecure123!`
   - **Name**: `Starbucks Coffee Owner Manager`
   - **Store**: `Starbucks Coffeehouse Seattle` (linked to this owner)

---

## Form Validation Constraints
These are strictly validated on both the client (React forms) and server (Express validator middlewares):
- **Name**: Min 20 characters, Max 60 characters.
- **Address**: Max 400 characters.
- **Password**: 8 to 16 characters, containing at least one uppercase letter and one special character.
- **Email**: Standard RFC email format.
