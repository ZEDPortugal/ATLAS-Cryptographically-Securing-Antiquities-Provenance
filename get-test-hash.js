require('dotenv').config({path:'.env.local'});
const { sql } = require('@vercel/postgres');

async function test() {
  try {
    console.log('Getting full hash for testing...\n');
    
    // Get the full hash from blockchain
    const blockchainResult = await sql`
      SELECT b.antique_hash, b.owner, a.name 
      FROM blockchain b
      JOIN antiques a ON b.antique_hash = a.hash
      LIMIT 1
    `;
    
    if (blockchainResult.rows.length > 0) {
      const row = blockchainResult.rows[0];
      console.log('Found registered antique:');
      console.log('Name:', row.name);
      console.log('Owner:', row.owner);
      console.log('Hash:', row.antique_hash);
      console.log('\nCopy this hash to test verification ↑');
    } else {
      console.log('No blockchain entries found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

test();
