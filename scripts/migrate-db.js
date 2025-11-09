const { sql } = require('@vercel/postgres');

async function initializeDatabase() {
  console.log('Starting database migration...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        position VARCHAR(255) NOT NULL,
        hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table "users" created or already exists.');

    await sql`
      CREATE TABLE IF NOT EXISTS artifacts (
        hash VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        images JSONB NOT NULL,
        created_at BIGINT NOT NULL,
        combined_hash VARCHAR(128),
        image_phash VARCHAR(128),
        text_sig TEXT,
        provenance_digest VARCHAR(128)
      )
    `;
    console.log('Table "artifacts" created or already exists.');

    await sql`
      CREATE TABLE IF NOT EXISTS blockchain (
        id SERIAL PRIMARY KEY,
        index INTEGER NOT NULL,
        timestamp BIGINT NOT NULL,
        artifact_hash VARCHAR(255) NOT NULL,
        owner VARCHAR(500) NOT NULL,
        previous_hash VARCHAR(255) NOT NULL,
        hash VARCHAR(255) NOT NULL UNIQUE,
        FOREIGN KEY (artifact_hash) REFERENCES artifacts(hash)
      )
    `;
    console.log('Table "blockchain" created or already exists.');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_artifact_hash ON blockchain(artifact_hash)
    `;
    console.log('Index "idx_artifact_hash" created or already exists.');

    await sql`
      CREATE TABLE IF NOT EXISTS access_codes (
        code VARCHAR(16) PRIMARY KEY,
        created_at BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        usage_count INTEGER NOT NULL DEFAULT 0,
        last_used BIGINT,
        deleted BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;
    console.log('Table "access_codes" created or already exists.');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_access_codes_expires ON access_codes(expires_at)`;
    console.log('Index "idx_access_codes_expires" created or already exists.');

    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1); // Exit with an error code to fail the build
  }
}

initializeDatabase();
