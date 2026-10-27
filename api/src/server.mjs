import { createApp } from './app.mjs';
import { config } from './config/env.mjs';
import { seedDemoData } from './db/demoData.mjs';
import { sequelize } from './models/index.mjs';
import { eventRepository } from './repositories/eventRepository.mjs';
import { logger } from './utils/logger.mjs';

async function start() {
  await sequelize.sync();

  // First start on a fresh clone: fill the empty database so the UI has something to show.
  if ((await eventRepository.count()) === 0) {
    await seedDemoData();
    logger.info('Empty database, demo data added');
  }

  createApp().listen(config.port, () => {
    logger.info(`Campus Events API running on port ${config.port}`);
  });
}

start();
