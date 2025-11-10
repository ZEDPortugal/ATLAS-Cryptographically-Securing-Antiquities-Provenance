require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS antiques (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        images JSONB,
        created_at BIGINT,
        combined_hash VARCHAR(255),
        image_phash VARCHAR(255),
        text_sig VARCHAR(255),
        provenance_digest VARCHAR(255)
      );
    `;
    console.log('Successfully created "antiques" table.');
  } catch (error) {
    console.error('Error creating "antiques" table:', error);
    process.exit(1);
  }
}

main();
