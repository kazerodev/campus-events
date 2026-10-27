import path from 'node:path';

const apiDir = path.resolve(import.meta.dirname, '../..');

if (process.env.NODE_ENV !== 'test') {
  try {
    process.loadEnvFile(path.join(apiDir, '.env'));
  } catch {
    // no .env
  }
}

export const config = {
  isTest: process.env.NODE_ENV === 'test',
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  dbStorage: process.env.DB_STORAGE || path.join(apiDir, 'data', 'events.sqlite'),
  smtpUrl: process.env.SMTP_URL,
  mailFrom: process.env.MAIL_FROM || 'Campus Events <no-reply@campus-events.local>',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 30,
  webDistDir: path.join(apiDir, '..', 'web', 'dist')
};
