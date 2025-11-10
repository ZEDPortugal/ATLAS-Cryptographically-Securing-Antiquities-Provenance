// Test database connection and table setup
// Run with: node test-db-connection.js

import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');
  
  // Check environment variable
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL not found in environment variables');
    console.log('   Make sure .env.local exists with POSTGRES_URL set');
    process.exit(1);
  }
  
  console.log('✅ POSTGRES_URL found');
  console.log('   Connection string:', process.env.POSTGRES_URL.replace(/:[^:@]+@/, ':****@'));
  
  try {
    // Test basic query
    console.log('\n📡 Testing connection...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connected successfully!');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   PostgreSQL version:', result.rows[0].pg_version.split('\n')[0]);
    
    // Check tables
    console.log('\n📋 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`   Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    const requiredTables = ['users', 'antiques', 'blockchain', 'access_codes'];
    const missingTables = requiredTables.filter(
      table => !tables.rows.find(row => row.table_name === table)
    );
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables:', missingTables.join(', '));
      console.log('   Run: npm run db:init');
    } else {
      console.log('\n✅ All required tables exist!');
    }
    
    // Count records
    console.log('\n📊 Record counts:');
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   Users: ${userCount.rows[0].count}`);
      
      const antiqueCount = await sql`SELECT COUNT(*) as count FROM antiques`;
      console.log(`   Antiques: ${antiqueCount.rows[0].count}`);
      
      const blockCount = await sql`SELECT COUNT(*) as count FROM blockchain`;
      console.log(`   Blockchain entries: ${blockCount.rows[0].count}`);
      
      const codeCount = await sql`SELECT COUNT(*) as count FROM access_codes`;
      console.log(`   Access codes: ${codeCount.rows[0].count}`);
    } catch (err) {
      console.log('   ⚠️  Could not count records (tables may not exist)');
    }
    
    console.log('\n✅ Database test complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('   Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check database host is correct');
      console.log('   - Verify internet connection');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Wrong username or password');
      console.log('   - Get fresh connection string from Neon Console');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Database may be paused (check Neon Console)');
      console.log('   - Network firewall blocking connection');
    }
    
    console.log('\n   Check: https://console.neon.tech\n');
    process.exit(1);
  }
}

testConnection();
