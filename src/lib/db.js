import crypto from 'crypto';
import { sql } from '@vercel/postgres';

// Export the sql helper so other modules can use the same serverless-friendly client
export { sql };

export async function initializeDatabase() {
  try {
    console.log('Database connection ready.');
  } catch (error) {
    console.error('Error initializing database:', error);
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
  await sql`
    INSERT INTO antiques (hash, name, description, images, created_at, combined_hash, image_phash, text_sig, provenance_digest)
    VALUES (${hash}, ${antique.name}, ${antique.description || ''}, ${JSON.stringify(antique.images)}, ${antique.createdAt}, ${antique.combinedHash || null}, ${antique.imagePhash || null}, ${antique.textSig || null}, ${antique.provenanceDigest || null})
    ON CONFLICT (hash) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      images = EXCLUDED.images,
      created_at = EXCLUDED.created_at,
      combined_hash = COALESCE(EXCLUDED.combined_hash, antiques.combined_hash),
      image_phash = COALESCE(EXCLUDED.image_phash, antiques.image_phash),
      text_sig = COALESCE(EXCLUDED.text_sig, antiques.text_sig),
      provenance_digest = COALESCE(EXCLUDED.provenance_digest, antiques.provenance_digest)
  `;
  return { ...antique, hash };
}

export async function getAntique(hash) {
  const result = await sql`
    SELECT * FROM antiques WHERE hash = ${hash} LIMIT 1
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
  constructor({ index, timestamp, antiqueHash, owner, previousHash = '' }) {
    this.index = index;
    this.timestamp = timestamp;
    this.antiqueHash = antiqueHash;
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
  // Get the last block
  const lastBlockResult = await sql`
    SELECT * FROM blockchain ORDER BY index DESC LIMIT 1
  `;
  
  const index = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].index + 1 : 0;
  const timestamp = Date.now();
  const previousHash = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].hash : '';
  
  const block = new Block({ index, timestamp, antiqueHash, owner, previousHash });
  
  await sql`
    INSERT INTO blockchain (index, timestamp, antique_hash, owner, previous_hash, hash)
    VALUES (${block.index}, ${block.timestamp}, ${block.antiqueHash}, ${block.owner}, ${block.previousHash}, ${block.hash})
  `;
  
  return block;
}

export async function findByHash(antiqueHash) {
  const result = await sql`
    SELECT * FROM blockchain WHERE antique_hash = ${antiqueHash} LIMIT 1
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
