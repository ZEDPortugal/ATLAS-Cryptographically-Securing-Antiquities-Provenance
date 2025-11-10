require('dotenv').config({path:'.env.local'});
const { sql } = require('@vercel/postgres');
const crypto = require('crypto');

function sha3(input) {
  return crypto.createHash('sha3-512').update(input).digest('hex');
}

class Block {
  constructor({ index, timestamp, antique_hash, owner, previousHash = '' }) {
    this.index = index;
    this.timestamp = timestamp;
    this.antiqueHash = antique_hash;
    this.owner = owner;
    this.previousHash = previousHash;
    this.hash = this.computeHash();
  }

  computeHash() {
    return sha3(`${this.index}|${this.timestamp}|${this.antiqueHash}|${this.owner}|${this.previousHash}`);
  }
}

async function fixNeonBlockchain() {
  try {
    console.log('Fixing blockchain entries in Neon PostgreSQL...\n');
    
    // Get all antiques without blockchain entries
    const antiquesResult = await sql`
      SELECT a.hash, a.name, a.created_at
      FROM antiques a
      WHERE NOT EXISTS (
        SELECT 1 FROM blockchain b WHERE LOWER(b.antique_hash) = LOWER(a.hash)
      )
      ORDER BY a.created_at ASC
    `;
    
    if (antiquesResult.rows.length === 0) {
      console.log('✅ All antiques already have blockchain entries!');
      process.exit(0);
      return;
    }
    
    console.log(`Found ${antiquesResult.rows.length} antique(s) without blockchain entries:\n`);
    
    // Get the last blockchain index
    const lastBlockResult = await sql`
      SELECT * FROM blockchain ORDER BY index DESC LIMIT 1
    `;
    
    let currentIndex = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].index + 1 : 0;
    let previousHash = lastBlockResult.rows.length > 0 ? lastBlockResult.rows[0].hash : '';
    
    // Create blockchain entries for each antique
    for (const antique of antiquesResult.rows) {
      console.log(`Creating blockchain entry for: ${antique.name}`);
      console.log(`  Hash: ${antique.hash.substring(0, 50)}...`);
      
      const timestamp = antique.created_at || Date.now();
      const owner = 'System Migration'; // Default owner for migration
      
      const block = new Block({
        index: currentIndex,
        timestamp: timestamp,
        antique_hash: antique.hash.toLowerCase().trim(),
        owner: owner,
        previousHash: previousHash
      });
      
      await sql`
        INSERT INTO blockchain (index, timestamp, antique_hash, owner, previous_hash, hash)
        VALUES (${block.index}, ${block.timestamp}, ${block.antiqueHash}, ${block.owner}, ${block.previousHash}, ${block.hash})
      `;
      
      console.log(`  ✅ Created block #${currentIndex}\n`);
      
      // Update for next iteration
      currentIndex++;
      previousHash = block.hash;
    }
    
    console.log('✅ Successfully created blockchain entries for all antiques!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
  process.exit(0);
}

fixNeonBlockchain();
