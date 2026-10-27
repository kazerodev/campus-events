import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createMemoryCache } from './cache/memoryCache.mjs';
import { config } from './config/env.mjs';
import { createEventController } from './controllers/eventController.mjs';
import { createHealthController } from './controllers/healthController.mjs';
import { createRegistrationController } from './controllers/registrationController.mjs';
import { createStatsController } from './controllers/statsController.mjs';
import { createMailer } from './mail/mailer.mjs';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.mjs';
import { requestLogger } from './middleware/requestLogger.mjs';
import { eventRepository } from './repositories/eventRepository.mjs';
import { healthRepository } from './repositories/healthRepository.mjs';
import { registrationRepository } from './repositories/registrationRepository.mjs';
import { apiRoutes } from './routes/index.mjs';
import { createEventService } from './services/eventService.mjs';
import { createHealthService } from './services/healthService.mjs';
import { createRegistrationService } from './services/registrationService.mjs';
import { createStatsService } from './services/statsService.mjs';
import { logger } from './utils/logger.mjs';

function serveFrontend(app) {
  const indexFile = path.join(config.webDistDir, 'index.html');
  if (!fs.existsSync(indexFile)) return;

  app.use(express.static(config.webDistDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(indexFile);
  });
}

export function createApp({
  mailer = createMailer({ smtpUrl: config.smtpUrl, from: config.mailFrom }),
  cache = createMemoryCache({ ttlSeconds: config.cacheTtlSeconds })
} = {}) {
  const deps = { events: eventRepository, registrations: registrationRepository, cache, mailer, logger };

  const controllers = {
    health: createHealthController(createHealthService({ health: healthRepository })),
    events: createEventController(createEventService(deps)),
    registrations: createRegistrationController(createRegistrationService(deps)),
    stats: createStatsController(createStatsService(deps))
  };

  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use('/api', apiRoutes(controllers));
  serveFrontend(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
