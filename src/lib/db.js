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
    
    // Create artifacts table
    await sql`
      CREATE TABLE IF NOT EXISTS artifacts (
        hash VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        images JSONB NOT NULL,
        created_at BIGINT NOT NULL
      )
    `;
    
    // Create blockchain table
    await sql`
      CREATE TABLE IF NOT EXISTS blockchain (
        id SERIAL PRIMARY KEY,
        index INTEGER NOT NULL,
        timestamp BIGINT NOT NULL,
        artifact_hash VARCHAR(255) NOT NULL,
        owner VARCHAR(500) NOT NULL,
        previous_hash VARCHAR(255) NOT NULL,
        hash VARCHAR(255) NOT NULL UNIQUE,
        FOREIGN KEY (artifact_hash) REFERENCES artifacts(hash)
      )
    `;
    
    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_artifact_hash ON blockchain(artifact_hash)
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

// ============================================
// ARTIFACT FUNCTIONS
// ============================================

export async function saveArtifact(hash, artifact) {
  await sql`
    INSERT INTO artifacts (hash, name, description, images, created_at)
    VALUES (${hash}, ${artifact.name}, ${artifact.description || ''}, ${JSON.stringify(artifact.images)}, ${artifact.createdAt})
    ON CONFLICT (hash) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      created_at = EXCLUDED.created_at
  `;
  return { ...artifact, hash };
}

export async function getArtifact(hash) {
  const result = await sql`
    SELECT * FROM artifacts WHERE hash = ${hash} LIMIT 1
  `;
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    hash: row.hash,
    name: row.name,
    description: row.description,
    images: row.images,
    createdAt: row.created_at,
  };
}

// ============================================
// BLOCKCHAIN FUNCTIONS
// ============================================

function sha3(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex');
}

export class Block {
  constructor({ index, timestamp, artifactHash, owner, previousHash = '' }) {
    this.index = index;
    this.timestamp = timestamp;
    this.artifactHash = artifactHash;
    this.owner = owner;
    this.previousHash = previousHash;
    this.hash = this.computeHash();
  }

  computeHash() {
    return sha3(`${this.index}|${this.timestamp}|${this.artifactHash}|${this.owner}|${this.previousHash}`);
  }
}

export async function loadChain() {
  const result = await sql`
    SELECT * FROM blockchain ORDER BY index ASC
  `;
  return result.rows.map(row => ({
    index: row.index,
    timestamp: row.timestamp,
    artifactHash: row.artifact_hash,
    owner: row.owner,
    previousHash: row.previous_hash,
    hash: row.hash,
  }));
}

export async function appendBlock({ artifactHash, owner }) {
  // Get the last block
  const lastBlockResult = await sql`
    SELECT * FROM blockchain ORDER BY index DESC LIMIT 1
  `;
  
  const index = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].index + 1 : 0;
  const timestamp = Date.now();
  const previousHash = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].hash : '';
  
  const block = new Block({ index, timestamp, artifactHash, owner, previousHash });
  
  await sql`
    INSERT INTO blockchain (index, timestamp, artifact_hash, owner, previous_hash, hash)
    VALUES (${block.index}, ${block.timestamp}, ${block.artifactHash}, ${block.owner}, ${block.previousHash}, ${block.hash})
  `;
  
  return block;
}

export async function findByHash(artifactHash) {
  const result = await sql`
    SELECT * FROM blockchain WHERE artifact_hash = ${artifactHash} LIMIT 1
  `;
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    index: row.index,
    timestamp: row.timestamp,
    artifactHash: row.artifact_hash,
    owner: row.owner,
    previousHash: row.previous_hash,
    hash: row.hash,
  };
}
