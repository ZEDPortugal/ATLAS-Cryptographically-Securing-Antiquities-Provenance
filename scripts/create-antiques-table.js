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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Successfully created "antiques" table.');
  } catch (error) {
    console.error('Error creating "antiques" table:', error);
    process.exit(1);
  }
}

main();
