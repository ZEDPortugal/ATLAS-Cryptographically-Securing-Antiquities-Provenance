import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    await sql`
      ALTER TABLE artifacts
      ALTER COLUMN combined_hash TYPE VARCHAR(255),
      ALTER COLUMN image_phash TYPE VARCHAR(255),
      ALTER COLUMN provenance_digest TYPE VARCHAR(255);
    `;
    return NextResponse.json({ message: 'Migration successful. The artifacts table has been altered.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Migration failed.', detail: error.message }, { status: 500 });
  }
}
