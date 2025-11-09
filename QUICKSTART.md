# 🚀 Quick Start Guide - Local Development with PostgreSQL

Follow these steps to get ATLAS running locally with PostgreSQL:

## Step 1: Check if PostgreSQL is Installed

```powershell
psql --version
```

If not installed, see detailed instructions in [LOCAL_POSTGRES_SETUP.md](./LOCAL_POSTGRES_SETUP.md)

**Quick Install (Windows with Chocolatey):**
```powershell
choco install postgresql
```

**Or use Docker:**
```powershell
docker run --name atlas-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=atlas -p 5432:5432 -d postgres:15
```

## Step 2: Create the Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql prompt)
CREATE DATABASE atlas;
\q
```

**Or using command:**
```powershell
createdb -U postgres atlas
```

## Step 3: Configure Environment

The `.env.local` file has been created with default settings. If you used a different password during PostgreSQL installation, update it:

```env
POSTGRES_PASSWORD="your_password_here"
```

## Step 4: Initialize Database Tables

```powershell
npm run db:init
```

This creates all necessary tables (users, artifacts, blockchain).

## Step 5: Start Development Server

```powershell
npm run dev
```

## Step 6: Create Your First User

1. Open browser: http://localhost:3000/dev-register
2. Fill in your details
3. **IMPORTANT: Save the generated hash key!**
4. Go to: http://localhost:3000/login
5. Login with username + hash key

## 🎉 You're Ready!

Your dashboard will be available at: http://localhost:3000

## Common Issues

### PostgreSQL not running?
```powershell
# Windows - Start the service
Start-Service postgresql-x64-15

# Check status
Get-Service -Name postgresql*
```

### Can't connect to database?
```powershell
# Test connection
psql -U postgres -d atlas -h localhost

# If it works, the setup is correct!
```

### Need more help?
See the detailed guide: [LOCAL_POSTGRES_SETUP.md](./LOCAL_POSTGRES_SETUP.md)

---

## Project Structure

```
atlas/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   ├── context/      # React contexts
│   │   └── ...           # Pages
│   └── lib/              # Utilities
│       ├── db.js         # Database functions
│       ├── blockchain.js # Blockchain logic
│       └── artifact.js   # Artifact handling
├── .env.local            # Environment variables (local)
└── scripts/
    └── init-db.js        # Database initialization
```

## Available Commands

```powershell
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run db:init   # Initialize database tables
npm run lint      # Run linter
```

## Features

✅ User Registration & Authentication (Hash-based)
✅ Artifact Registration with Images
✅ QR Code Generation
✅ Blockchain Verification
✅ PostgreSQL Database
✅ Responsive UI with Tailwind CSS
✅ Protected Routes
✅ React Icons Integration

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with @vercel/postgres
- **Styling:** Tailwind CSS 4
- **Icons:** React Icons
- **QR Codes:** qrcode + jsqr
- **Blockchain:** Custom SHA3-512 implementation
