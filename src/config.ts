import dotenv from 'dotenv';
import { Config } from './types.js';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function parseNumberEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw || raw.trim() === '') {
    return defaultValue;
  }
  const parsed = Number(raw.trim());
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid number for ${name}: "${raw}"`);
  }
  return parsed;
}

const adminUsername = requireEnv('ADMIN_USERNAME');
const adminPasswordHash = requireEnv('ADMIN_PASSWORD_HASH');
if (adminPasswordHash.length !== 60) {
  throw new Error(
    `ADMIN_PASSWORD_HASH must be a valid bcrypt hash of length 60, got length ${adminPasswordHash.length}`
  );
}

const sessionSecret = requireEnv('SESSION_SECRET');
if (sessionSecret.length < 32) {
  throw new Error(
    `SESSION_SECRET must be at least 32 characters long, got ${sessionSecret.length}`
  );
}

const frontendOrigin = requireEnv('FRONTEND_ORIGIN');
const port = parseNumberEnv('PORT', 4000);
const sessionTtlHours = parseNumberEnv('SESSION_TTL_HOURS', 8);

const rawNodeEnv = process.env['NODE_ENV']?.trim().toLowerCase();
const nodeEnv: 'development' | 'production' =
  rawNodeEnv === 'production' ? 'production' : 'development';

export const config: Readonly<Config> = Object.freeze({
  PORT: port,
  ADMIN_USERNAME: adminUsername,
  ADMIN_PASSWORD_HASH: adminPasswordHash,
  SESSION_SECRET: sessionSecret,
  SESSION_TTL_HOURS: sessionTtlHours,
  FRONTEND_ORIGIN: frontendOrigin,
  NODE_ENV: nodeEnv,
});
