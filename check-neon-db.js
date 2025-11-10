require('dotenv').config({path:'.env.local'});
const { sql } = require('@vercel/postgres');

async function checkNeonDB() {
  try {
    console.log('Connecting to Neon PostgreSQL...\n');
    console.log('Connection string:', process.env.POSTGRES_URL.substring(0, 50) + '...\n');
    
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('Tables in database:');
    tablesResult.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check antiques count
    const antiquesResult = await sql`SELECT COUNT(*) as count FROM antiques`;
    console.log('\nTotal antiques:', antiquesResult.rows[0].count);
    
    // Check blockchain count
    const blockchainResult = await sql`SELECT COUNT(*) as count FROM blockchain`;
    console.log('Total blockchain entries:', blockchainResult.rows[0].count);
    
    // Get sample data
    if (parseInt(antiquesResult.rows[0].count) > 0) {
      const samplesResult = await sql`SELECT hash, name FROM antiques LIMIT 3`;
      console.log('\nSample antique hashes:');
      samplesResult.rows.forEach(row => {
        console.log(`  - ${row.name}: ${row.hash.substring(0, 50)}...`);
      });
    }
    
    if (parseInt(blockchainResult.rows[0].count) > 0) {
      const blockchainSamples = await sql`SELECT antique_hash, owner FROM blockchain LIMIT 3`;
      console.log('\nSample blockchain entries:');
      blockchainSamples.rows.forEach(row => {
        console.log(`  - Owner: ${row.owner}, Hash: ${row.antique_hash.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
  process.exit(0);
}

checkNeonDB();
