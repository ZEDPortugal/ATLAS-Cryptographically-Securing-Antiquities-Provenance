# Local PostgreSQL Setup Guide

## Prerequisites

You need PostgreSQL installed on your machine. Choose one option:

### Option 1: PostgreSQL Installer (Recommended for Windows)
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer (includes pgAdmin GUI)
3. Default port: 5432
4. Set a password for the `postgres` user during installation

### Option 2: Using Chocolatey (Windows)
```powershell
choco install postgresql
```

### Option 3: Using Docker
```powershell
docker run --name atlas-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=atlas -p 5432:5432 -d postgres:15
```

## Setup Steps

### 1. Verify PostgreSQL is Running

```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Or check if port 5432 is listening
netstat -an | findstr :5432
```

### 2. Create the Database

**Option A: Using psql command line**
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE atlas;

# Exit
\q
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database"
4. Name it "atlas"
5. Click "Save"

**Option C: Using PowerShell**
```powershell
# Set your PostgreSQL bin path (adjust version number if needed)
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# Create database
createdb -U postgres atlas
```

### 3. Update Environment Variables

Open `.env.local` and update the password if you set a different one:

```env
POSTGRES_PASSWORD="your_actual_password"
```

### 4. Initialize the Database Tables

Run the initialization script:

```powershell
node scripts/init-db.js
```

This will create all necessary tables:
- `users` - User accounts
- `artifacts` - Artifact registry
- `blockchain` - Blockchain records

### 5. Start the Development Server

```powershell
npm run dev
```

### 6. Create Your First User

1. Navigate to: http://localhost:3000/dev-register
2. Fill in your details:
   - Name: Your full name
   - Username: Your login username
   - Position: Your role/position
3. **Save the generated hash key** - you'll need it to login
4. Navigate to: http://localhost:3000/login
5. Login with your username and hash key

## Troubleshooting

### Connection Refused Error

If you get a connection error:

1. **Check PostgreSQL is running:**
   ```powershell
   Get-Service -Name postgresql*
   ```
   
2. **Start PostgreSQL if stopped:**
   ```powershell
   Start-Service postgresql-x64-15  # Adjust service name
   ```

3. **Verify connection details in .env.local:**
   - Host: localhost
   - Port: 5432
   - Database: atlas
   - User: postgres
   - Password: (your password)

### Authentication Failed

If you get authentication errors:

1. **Reset postgres user password:**
   ```sql
   ALTER USER postgres PASSWORD 'postgres';
   ```

2. **Check pg_hba.conf** (allow local connections)
   Location: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`
   
   Ensure these lines exist:
   ```
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```

3. **Restart PostgreSQL after changes:**
   ```powershell
   Restart-Service postgresql-x64-15
   ```

### Database Does Not Exist

If the database doesn't exist:

```powershell
# Connect and create manually
psql -U postgres
CREATE DATABASE atlas;
\q
```

### Port Already in Use

If port 5432 is already in use:

```powershell
# Find what's using the port
netstat -ano | findstr :5432

# Stop the process or change the port in .env.local
```

## Testing the Connection

You can test the connection using psql:

```powershell
psql -U postgres -d atlas -h localhost -p 5432
```

If successful, you'll see:
```
atlas=#
```

## Viewing Data

### Using psql:
```sql
\c atlas          -- Connect to atlas database
\dt               -- List all tables
SELECT * FROM users;
SELECT * FROM artifacts;
SELECT * FROM blockchain;
```

### Using pgAdmin:
1. Open pgAdmin
2. Navigate: Servers > PostgreSQL > Databases > atlas > Schemas > public > Tables
3. Right-click on a table > View/Edit Data > All Rows

## Production Deployment

For production (Vercel), you'll use Vercel Postgres:

1. Go to Vercel Dashboard > Your Project > Storage
2. Create a Postgres database
3. Vercel automatically sets environment variables
4. Deploy your app

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
