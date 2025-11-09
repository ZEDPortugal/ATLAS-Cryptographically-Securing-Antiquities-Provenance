import crypto from 'crypto';
import { sql } from '@vercel/postgres';

// Export the sql helper so other modules can use the same serverless-friendly client
export { sql };

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
        created_at BIGINT NOT NULL,
        combined_hash VARCHAR(255),
        image_phash VARCHAR(255),
        text_sig TEXT,
        provenance_digest VARCHAR(255)
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

    // Access codes table
    await sql`
      CREATE TABLE IF NOT EXISTS access_codes (
        code VARCHAR(16) PRIMARY KEY,
        created_at BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        usage_count INTEGER NOT NULL DEFAULT 0,
        last_used BIGINT,
        deleted BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at)`;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // In a serverless environment, it's better to throw the error
    // to understand what's failing during deployment or execution.
    throw new Error(`Database initialization failed: ${error.message}`);
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
    INSERT INTO artifacts (hash, name, description, images, created_at, combined_hash, image_phash, text_sig, provenance_digest)
    VALUES (${hash}, ${artifact.name}, ${artifact.description || ''}, ${JSON.stringify(artifact.images)}, ${artifact.createdAt}, ${artifact.combinedHash || null}, ${artifact.imagePhash || null}, ${artifact.textSig || null}, ${artifact.provenanceDigest || null})
    ON CONFLICT (hash) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      created_at = EXCLUDED.created_at,
      combined_hash = COALESCE(EXCLUDED.combined_hash, artifacts.combined_hash),
      image_phash = COALESCE(EXCLUDED.image_phash, artifacts.image_phash),
      text_sig = COALESCE(EXCLUDED.text_sig, artifacts.text_sig),
      provenance_digest = COALESCE(EXCLUDED.provenance_digest, artifacts.provenance_digest)
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
    combinedHash: row.combined_hash,
    imagePhash: row.image_phash,
    textSig: row.text_sig,
    provenanceDigest: row.provenance_digest,
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
