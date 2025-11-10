import crypto from 'crypto';
import { sql } from '@vercel/postgres';

// Export the sql helper so other modules can use the same serverless-friendly client
export { sql };

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    return; // Already initialized
  }

  try {
    console.log('🔄 Initializing database tables...');
    
    // Create users table
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
    console.log('✅ Users table ready');

    // Create antiques table
    await sql`
      CREATE TABLE IF NOT EXISTS antiques (
        hash VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        images JSONB NOT NULL,
        created_at BIGINT NOT NULL,
        combined_hash VARCHAR(128),
        image_phash VARCHAR(128),
        text_sig TEXT,
        provenance_digest VARCHAR(128),
        provenance JSONB
      )
    `;
    console.log('✅ Antiques table ready');

    // Create blockchain table
    await sql`
      CREATE TABLE IF NOT EXISTS blockchain (
        id SERIAL PRIMARY KEY,
        index INTEGER NOT NULL,
        timestamp BIGINT NOT NULL,
        antique_hash VARCHAR(255) NOT NULL,
        owner VARCHAR(500) NOT NULL,
        previous_hash VARCHAR(255) NOT NULL,
        hash VARCHAR(255) NOT NULL UNIQUE,
        FOREIGN KEY (antique_hash) REFERENCES antiques(hash)
      )
    `;
    console.log('✅ Blockchain table ready');

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_antique_hash ON blockchain(antique_hash)
    `;

    // Create access_codes table
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
    console.log('✅ Access codes table ready');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at)
    `;

    isInitialized = true;
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
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
// ANTIQUE FUNCTIONS
// ============================================

export async function saveAntique(hash, antique) {
  // Normalize hash to lowercase for consistency
  if (!hash) {
    throw new Error('hash is required for saveAntique');
  }
  if (!antique || !antique.images) {
    throw new Error('antique object with images is required');
  }
  const normalizedHash = hash.toLowerCase().trim();
  
  await sql`
    INSERT INTO antiques (hash, name, description, images, created_at, combined_hash, image_phash, text_sig, provenance_digest, provenance)
    VALUES (${normalizedHash}, ${antique.name}, ${antique.description || ''}, ${JSON.stringify(antique.images)}, ${antique.createdAt}, ${antique.combinedHash || null}, ${antique.imagePhash || null}, ${antique.textSig || null}, ${antique.provenanceDigest || null}, ${antique.provenance ? JSON.stringify(antique.provenance) : null})
    ON CONFLICT (hash) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      created_at = EXCLUDED.created_at,
      combined_hash = COALESCE(EXCLUDED.combined_hash, antiques.combined_hash),
      image_phash = COALESCE(EXCLUDED.image_phash, antiques.image_phash),
      text_sig = COALESCE(EXCLUDED.text_sig, antiques.text_sig),
      provenance_digest = COALESCE(EXCLUDED.provenance_digest, antiques.provenance_digest),
      provenance = COALESCE(EXCLUDED.provenance, antiques.provenance)
  `;
  return { ...antique, hash: normalizedHash };
}

export async function getAntique(hash) {
  // Normalize hash to lowercase for consistent comparison
  const normalizedHash = hash.toLowerCase().trim();
  
  const result = await sql`
    SELECT * FROM antiques WHERE LOWER(hash) = ${normalizedHash} LIMIT 1
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
    provenance: row.provenance,
  };
}

export async function getAllAntiques() {
  const result = await sql`
    SELECT hash, name, description, created_at, combined_hash, image_phash, text_sig, provenance_digest
    FROM antiques
    ORDER BY created_at DESC
  `;
  return result.rows.map(row => ({
    hash: row.hash,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    combinedHash: row.combined_hash,
    imagePhash: row.image_phash,
    textSig: row.text_sig,
    provenanceDigest: row.provenance_digest,
  }));
}

export async function getAntiqueCount() {
  const result = await sql`
    SELECT COUNT(*) as count FROM antiques
  `;
  return parseInt(result.rows[0].count, 10);
}

// ============================================
// BLOCKCHAIN FUNCTIONS
// ============================================

function sha3(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex');
}

export class Block {
  constructor({ index, timestamp, antique_hash, owner, previousHash = '' }) {
    this.index = index;
    this.timestamp = timestamp;
    this.antiqueHash = antique_hash; // Store as camelCase
    this.owner = owner;
    this.previousHash = previousHash;
    this.hash = this.computeHash();
  }

  computeHash() {
    return sha3(`${this.index}|${this.timestamp}|${this.antiqueHash}|${this.owner}|${this.previousHash}`);
  }
}

export async function loadChain() {
  const result = await sql`
    SELECT * FROM blockchain ORDER BY index ASC
  `;
  return result.rows.map(row => ({
    index: row.index,
    timestamp: row.timestamp,
    antiqueHash: row.antique_hash,
    owner: row.owner,
    previousHash: row.previous_hash,
    hash: row.hash,
  }));
}

export async function appendBlock({ antiqueHash, owner }) {
  // Normalize hash to lowercase for consistency
  if (!antiqueHash) {
    throw new Error('antiqueHash is required for appendBlock');
  }
  const normalizedHash = antiqueHash.toLowerCase().trim();
  
  // Get the last block
  const lastBlockResult = await sql`
    SELECT * FROM blockchain ORDER BY index DESC LIMIT 1
  `;
  
  const index = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].index + 1 : 0;
  const timestamp = Date.now();
  const previousHash = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].hash : '';
  
  // Pass antique_hash with underscore to Block constructor
  const block = new Block({ 
    index, 
    timestamp, 
    antique_hash: normalizedHash,  // Use normalized hash
    owner, 
    previousHash 
  });
  
  await sql`
    INSERT INTO blockchain (index, timestamp, antique_hash, owner, previous_hash, hash)
    VALUES (${block.index}, ${block.timestamp}, ${block.antiqueHash}, ${block.owner}, ${block.previousHash}, ${block.hash})
  `;
  
  return block;
}

export async function findByHash(antiqueHash) {
  // Normalize hash to lowercase for consistent comparison
  const normalizedHash = antiqueHash.toLowerCase().trim();
  
  const result = await sql`
    SELECT * FROM blockchain WHERE LOWER(antique_hash) = ${normalizedHash} LIMIT 1
  `;
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    index: row.index,
    timestamp: row.timestamp,
    antiqueHash: row.antique_hash,
    owner: row.owner,
    previousHash: row.previous_hash,
    hash: row.hash,
  };
}

export async function getChainHeight() {
  const result = await sql`
    SELECT COUNT(*) as count FROM blockchain
  `;
  return parseInt(result.rows[0].count, 10);
}
