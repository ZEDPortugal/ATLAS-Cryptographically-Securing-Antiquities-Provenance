/**
 * Migration script to add provenance column to antiques table
 * Run this with: node scripts/add-provenance-column.js
 */

import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: '.env.local' });

async function addProvenanceColumn() {
  try {
    console.log('🔄 Starting migration: Adding provenance column...');
    
    // Check if column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'antiques' 
      AND column_name = 'provenance'
    `;
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Column "provenance" already exists. No migration needed.');
      return;
    }
    
    // Add provenance column
    console.log('📝 Adding provenance column to antiques table...');
    await sql`
      ALTER TABLE antiques 
      ADD COLUMN provenance JSONB
    `;
    
    console.log('✅ Successfully added provenance column!');
    console.log('');
    console.log('Migration complete. You can now register antiques with provenance data.');
    
  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run migration
addProvenanceColumn()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
