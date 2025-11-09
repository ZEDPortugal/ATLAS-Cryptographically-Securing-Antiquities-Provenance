// Time-limited access code management for buyer verification
import crypto from 'crypto';
import { initializeDatabase, sql } from './db.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return code;
}

export async function createAccessCode(expirationHours = 48, createdBy = 'staff') {
  await initializeDatabase();
  const code = generateCode();
  const createdAt = Date.now();
  const expiresAt = createdAt + expirationHours * 60 * 60 * 1000;
  await sql`INSERT INTO access_codes (code, created_at, expires_at, created_by) VALUES (${code}, ${createdAt}, ${expiresAt}, ${createdBy})`;
  return { code, createdAt, expiresAt, createdBy, usageCount: 0 };
}

export async function validateAccessCode(code) {
  await initializeDatabase();
  const upper = code.toUpperCase();
  const now = Date.now();
  const result = await sql`SELECT * FROM access_codes WHERE code = ${upper} AND deleted = FALSE`;
  if (result.rows.length === 0) {
    return { valid: false, reason: 'Code not found' };
  }
  const row = result.rows[0];
  if (row.expires_at < now) {
    return { valid: false, reason: 'Code expired' };
  }
  const newUsage = row.usage_count + 1;
  await sql`UPDATE access_codes SET usage_count = ${newUsage}, last_used = ${now} WHERE code = ${upper}`;
  return {
    valid: true,
    code: {
      code: row.code,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      createdBy: row.created_by,
      usageCount: newUsage,
      lastUsed: now,
    },
  };
}

export async function getAllAccessCodes() {
  await initializeDatabase();
  const result = await sql`SELECT code, created_at, expires_at, created_by, usage_count, last_used FROM access_codes WHERE deleted = FALSE ORDER BY created_at DESC`;
  return result.rows.map(r => ({
    code: r.code,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    createdBy: r.created_by,
    usageCount: r.usage_count,
    lastUsed: r.last_used,
  }));
}

export async function deleteAccessCode(code) {
  await initializeDatabase();
  await sql`UPDATE access_codes SET deleted = TRUE WHERE code = ${code.toUpperCase()}`;
  return true;
}

export async function cleanupExpiredCodes() {
  await initializeDatabase();
  const now = Date.now();
  const result = await sql`UPDATE access_codes SET deleted = TRUE WHERE expires_at < ${now} AND deleted = FALSE RETURNING code`;
  return result.rowCount; // number marked deleted
}
