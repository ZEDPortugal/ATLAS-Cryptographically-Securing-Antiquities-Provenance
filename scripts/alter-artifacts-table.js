require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function alterArtifactsTable() {
  try {
    console.log('Altering artifacts table...');
    await sql`
      ALTER TABLE artifacts
      ALTER COLUMN combined_hash TYPE VARCHAR(255),
      ALTER COLUMN image_phash TYPE VARCHAR(255),
      ALTER COLUMN provenance_digest TYPE VARCHAR(255);
    `;
    console.log('Artifacts table altered successfully.');
  } catch (error) {
    console.error('Error altering artifacts table:', error);
    process.exit(1);
  }
}

alterArtifactsTable();
