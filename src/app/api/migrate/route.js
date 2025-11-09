import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Add columns if they don't exist. This is safer than assuming they do.
    await sql`ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS combined_hash VARCHAR(255);`;
    await sql`ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS image_phash VARCHAR(255);`;
    await sql`ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS text_sig TEXT;`;
    await sql`ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS provenance_digest VARCHAR(255);`;
    
    return NextResponse.json({ message: 'Migration successful. Columns added to artifacts table.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Migration failed.', detail: error.message }, { status: 500 });
  }
}
