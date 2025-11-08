import { sql } from '@vercel/postgres';
import crypto from 'crypto';

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
