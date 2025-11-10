import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
    errors: []
  };

  // Check 1: Environment variables
  diagnostics.checks.envVars = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    REGISTER_SECRET: !!process.env.REGISTER_SECRET,
    SALT: !!process.env.SALT,
    NEXT_PUBLIC_DEV_ACCESS_KEY: !!process.env.NEXT_PUBLIC_DEV_ACCESS_KEY
  };

  // Check 2: Database connection
  try {
    await sql`SELECT 1 as test`;
    diagnostics.checks.database = {
      connected: true,
      message: 'Successfully connected to PostgreSQL'
    };
  } catch (error) {
    diagnostics.checks.database = {
      connected: false,
      error: error.message
    };
    diagnostics.errors.push(`Database connection failed: ${error.message}`);
  }

  // Check 3: Tables exist
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'antiques', 'blockchain', 'access_codes')
    `;
    
    diagnostics.checks.tables = {
      found: tables.rows.map(r => r.table_name),
      required: ['users', 'antiques', 'blockchain', 'access_codes'],
      allPresent: tables.rows.length === 4
    };

    if (tables.rows.length < 4) {
      const missing = ['users', 'antiques', 'blockchain', 'access_codes']
        .filter(t => !tables.rows.find(r => r.table_name === t));
      diagnostics.errors.push(`Missing tables: ${missing.join(', ')}`);
    }
  } catch (error) {
    diagnostics.checks.tables = {
      error: error.message
    };
    diagnostics.errors.push(`Table check failed: ${error.message}`);
  }

  // Check 4: Count records
  try {
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const antiqueCount = await sql`SELECT COUNT(*) as count FROM antiques`;
    const blockCount = await sql`SELECT COUNT(*) as count FROM blockchain`;

    diagnostics.checks.records = {
      users: parseInt(userCount.rows[0].count, 10),
      antiques: parseInt(antiqueCount.rows[0].count, 10),
      blocks: parseInt(blockCount.rows[0].count, 10)
    };
  } catch (error) {
    diagnostics.checks.records = {
      error: error.message
    };
  }

  // Determine overall health
  diagnostics.healthy = diagnostics.errors.length === 0;
  diagnostics.summary = diagnostics.healthy 
    ? '✅ All systems operational' 
    : `⚠️ ${diagnostics.errors.length} issue(s) detected`;

  return NextResponse.json(diagnostics, { 
    status: diagnostics.healthy ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
