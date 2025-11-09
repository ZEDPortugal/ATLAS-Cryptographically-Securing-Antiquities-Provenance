// Database initialization script
// Run this with: node scripts/init-db.js

import { initializeDatabase } from '../src/lib/db.js';

async function main() {
  console.log('🔄 Initializing database...');
  
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('\nYou can now:');
    console.log('1. Run: npm run dev');
    console.log('2. Navigate to /dev-register to create your first user');
    console.log('3. Use the generated hash to login');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running locally');
    console.error('2. Database "atlas" exists (run: createdb atlas)');
    console.error('3. Connection details in .env.local are correct');
    process.exit(1);
  }
  
  process.exit(0);
}

main();
