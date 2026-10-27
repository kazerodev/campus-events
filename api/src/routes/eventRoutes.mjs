import { Router } from 'express';
import { validate } from '../middleware/validate.mjs';
import { createEventBody, idParams, registrationBody, updateEventBody } from '../validation/schemas.mjs';

export function eventRoutes({ events, registrations }) {
  const router = Router();

  router.get('/', events.list);
  router.post('/', validate({ body: createEventBody }), events.create);
  router.get('/:id', validate({ params: idParams }), events.getById);
  router.patch('/:id', validate({ params: idParams, body: updateEventBody }), events.update);
  router.delete('/:id', validate({ params: idParams }), events.remove);

  router.get('/:id/registrations', validate({ params: idParams }), registrations.list);
  router.post('/:id/registrations', validate({ params: idParams, body: registrationBody }), registrations.create);

  return router;
}
