import { createApp } from '../../src/app.mjs';
import { Event, Registration, sequelize } from '../../src/models/index.mjs';

export const silentMailer = { async sendRegistrationConfirmation() {} };

// .env.test sets DB_STORAGE=:memory:, so the tests never touch your real data.
// Every call empties all tables and builds a new app with an empty cache: tests never share state.
export async function createTestApp({ mailer = silentMailer, cache } = {}) {
  await sequelize.sync({ force: true });
  const app = createApp({ mailer, cache });
  return { app, db: { sequelize, Event, Registration } };
}

export const validEvent = (overrides = {}) => ({
  title: 'Backend Bootcamp',
  location: 'Room C101',
  startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  capacity: 10,
  ...overrides
});
