# Deployment Guide for ATLAS

## Issue: File System Not Available on Vercel

The current implementation uses file system (`fs`) to store users, which doesn't work on Vercel's serverless platform.

## Solution: Use Vercel Postgres (Recommended)

### Step 1: Install Vercel Postgres SDK

```bash
npm install @vercel/postgres
```

### Step 2: Set Up Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Follow the setup wizard
6. Vercel will automatically add environment variables to your project

### Step 3: Create Database Schema

Create a file `src/lib/db.js`:

```javascript
import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        position VARCHAR(255) NOT NULL,
        hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function createUser(name, username, position, hash) {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO users (id, name, username, position, hash)
    VALUES (${id}, ${name}, ${username.toLowerCase()}, ${position}, ${hash})
  `;
  return { id, name, username: username.toLowerCase(), position, hash };
}

export async function findUserByUsername(username) {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username.toLowerCase()} LIMIT 1
  `;
  return result.rows[0];
}

export async function findUserByCredentials(username, hash) {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username.toLowerCase()} AND hash = ${hash} LIMIT 1
  `;
  return result.rows[0];
}

export async function getAllUsers() {
  const result = await sql`SELECT id, name, username, position, created_at FROM users`;
  return result.rows;
}
```

### Step 4: Update API Routes

Update `src/app/api/auth/register-user/route.js`:

```javascript
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createUser, findUserByUsername, initializeDatabase } from "@/lib/db";

export async function POST(request) {
  try {
    // Initialize database (safe to call multiple times)
    await initializeDatabase();
    
    const { name, username, position } = await request.json();

    // Validate input
    if (!name || !username || !position) {
      return NextResponse.json(
        { error: "Name, username, and position are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Generate a unique hash for this user
    const hash = crypto
      .createHash("sha256")
      .update(`${username}-${Date.now()}-${Math.random()}`)
      .digest("hex")
      .substring(0, 32);

    // Create user
    const newUser = await createUser(name, username, position, hash);

    return NextResponse.json({
      success: true,
      hash,
      username: newUser.username,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration: " + error.message },
      { status: 500 }
    );
  }
}
```

Update `src/app/api/auth/login/route.js`:

```javascript
import { NextResponse } from "next/server";
import { findUserByCredentials } from "@/lib/db";

export async function POST(request) {
  try {
    const { username, hash } = await request.json();

    // Validate input
    if (!username || !hash) {
      return NextResponse.json(
        { error: "Username and hash key are required" },
        { status: 400 }
      );
    }

    // Find user by username and hash
    const user = await findUserByCredentials(username, hash);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or hash key" },
        { status: 401 }
      );
    }

    // Return user data without hash
    const { hash: _, ...userWithoutHash } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutHash,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
```

## Alternative: Use Vercel KV (Redis)

If you prefer a simpler key-value store:

```bash
npm install @vercel/kv
```

Then set up Vercel KV in your Vercel dashboard and use it to store user data as JSON.

## Quick Fix Applied

The code has been temporarily updated to use in-memory storage, which will allow deployment but **users won't persist**. Please implement one of the database solutions above for production use.
