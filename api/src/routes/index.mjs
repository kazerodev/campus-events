import { Router } from 'express';
import { eventRoutes } from './eventRoutes.mjs';

export function apiRoutes(controllers) {
  const router = Router();

  router.get('/health', controllers.health.get);
  router.get('/stats', controllers.stats.get);
  router.use('/events', eventRoutes(controllers));

  return router;
}
