# Store Rating Platform

A beautiful, premium fullstack web application for registering stores and submitting user ratings (1 to 5 stars). The application features a robust ExpressJS + TypeScript + Prisma backend and a high-fidelity React + Vite + TypeScript frontend, designed with a stunning Obsidian Glassmorphic Dark UI Theme.

## Tech Stack
- **Backend**: ExpressJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL (Docker-compose)
- **Frontend**: ReactJS, Vite, TypeScript, Vanilla CSS (Custom Design System)

---

## Seeded Indian Profiles for Testing & Demo

The database is pre-seeded with highly realistic Indian corporate, user, and merchant records. 
> [!IMPORTANT]
> To comply with the strict validation rule (`Name: Min 20 characters, Max 60 characters`), all seeded accounts have names of at least 20 characters.

### 1. 🛡️ System Administrator
- **Email**: `admin.account@example.com`
- **Password**: `AdminSecure123!`
- **Name**: `Administrator Account Executive`
- **Address**: `Plot No. 12, Tech Park Boulevard, Sector 62, Noida, Uttar Pradesh 201301`

### 2. 👤 Normal User (Submit & Modify Ratings)
- **Email**: `normal.user@example.com`
- **Password**: `UserSecure123!`
- **Name**: `Aditya Vardhan Suryavanshi`
- **Address**: `Flat 402, Royal Residency, Senapati Bapat Road, Pune, Maharashtra 411016`

### 3. 🏪 Store Owners & Stores

*   **Starbucks Coffee Koramangala**
    - **Owner Name**: `Rajesh Kumar Subramaniam`
    - **Owner/Store Email**: `starbucks.owner@example.com`
    - **Password**: `OwnerSecure123!`
    - **Address**: `Ground Floor, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034`

*   **Nature's Basket Indira Nagar**
    - **Owner Name**: `Meenakshi Iyer Krishnan`
    - **Owner/Store Email**: `wholefoods.owner@example.com`
    - **Password**: `OwnerSecure123!`
    - **Address**: `12th Main Road, Indira Nagar, Bengaluru, Karnataka 560038`

*   **Fabindia Lifestyle Galleria**
    - **Owner Name**: `Vikramaditya Pratap Singh`
    - **Owner/Store Email**: `alexander.owner@example.com`
    - **Password**: `OwnerSecure123!`
    - **Address**: `Khan Market, Rabindra Nagar, New Delhi, Delhi 110003`

---

## Getting Started & Run Guidelines

### 1. Start the Database Container
Ensure you have Docker running, then launch the PostgreSQL instance:
```bash
docker-compose up -d
```
The database will run on `localhost:5432` with credentials:
- **DB Name**: `store_rating_db`
- **Username**: `postgres`
- **Password**: `postgres_password`

### 2. Setup the Backend API
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (pre-configured):
   ```env
   DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/store_rating_db?schema=public"
   JWT_SECRET="super_secret_jwt_key_12345!"
   PORT=5000
   ```
4. Push the schema and sync the database:
   ```bash
   npx prisma db push
   ```
5. Seed the database with the Indian profiles:
   ```bash
   npm run seed
   ```
6. Start the API dev server:
   ```bash
   npm run dev
   ```

### 3. Setup the React Frontend
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to play with the live application!

---

## Form Validation Constraints
These are strictly validated on both the client (React forms) and server (Express validator middlewares):
- **Name**: Min 20 characters, Max 60 characters.
- **Address**: Required, Max 400 characters.
- **Password**: 8 to 16 characters, containing at least one uppercase letter and one special character.
- **Email**: Standard RFC email format.
