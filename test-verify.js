require('dotenv').config({path:'.env.local'});
const { sql } = require('@vercel/postgres');

async function test() {
  try {
    console.log('Testing database queries...\n');
    
    // Check antiques count
    const antiquesResult = await sql`SELECT COUNT(*) as count FROM antiques`;
    console.log('Total antiques:', antiquesResult.rows[0].count);
    
    // Check blockchain count
    const blockchainResult = await sql`SELECT COUNT(*) as count FROM blockchain`;
    console.log('Total blockchain entries:', blockchainResult.rows[0].count);
    
    // Get sample antique hashes
    const samplesResult = await sql`SELECT hash, name FROM antiques LIMIT 3`;
    console.log('\nSample antique hashes:');
    samplesResult.rows.forEach(row => {
      console.log(`- ${row.name}: ${row.hash.substring(0, 40)}...`);
    });
    
    // Check if blockchain entries match
    const blockchainSamples = await sql`SELECT antique_hash, owner FROM blockchain LIMIT 3`;
    console.log('\nSample blockchain entries:');
    blockchainSamples.rows.forEach(row => {
      console.log(`- Owner: ${row.owner}, Hash: ${row.antique_hash.substring(0, 40)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

test();
