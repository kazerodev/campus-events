import { conflict, notFound } from '../errors/AppError.mjs';

export function createRegistrationService({ events, registrations, cache, mailer, logger }) {
  async function getEventOrFail(id) {
    const event = await events.findById(id);
    if (!event) throw notFound(`Event with id ${id} not found`);
    return event;
  }

  function sendConfirmation(event, registration) {
    mailer
      .sendRegistrationConfirmation({ email: registration.email, name: registration.name, event })
      .catch((err) => logger.warn('confirmation mail failed', { registrationId: registration.id, error: err.message }));
  }

  return {
    listForEvent(eventId) {
      return cache.getOrSet(`events:${eventId}:registrations`, async () => {
        await getEventOrFail(eventId);
        return registrations.findByEvent(eventId);
      });
    },

    async register(eventId, { name, email }) {
      const event = await getEventOrFail(eventId);

      if (await registrations.exists(eventId, email)) {
        throw conflict(`${email} is already registered for this event`);
      }

      const registered = await registrations.countByEvent(eventId);
      if (registered >= event.capacity) {
        throw conflict('Event is full');
      }

      const registration = await registrations.create({ eventId, name, email });
      cache.clear();
      logger.info('new registration', { eventId, registrationId: registration.id });

      sendConfirmation(event, registration);
      return registration;
    }
  };
}
