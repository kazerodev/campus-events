import { notFound } from '../errors/AppError.mjs';

export function createEventService({ events, registrations, cache }) {
  return {
    list() {
      return cache.getOrSet('events', () => events.findAll());
    },

    getById(id) {
      return cache.getOrSet(`events:${id}`, async () => {
        const event = await events.findById(id);
        if (!event) throw notFound(`Event with id ${id} not found`);
        const registered = await registrations.countByEvent(id);
        return { ...event, registered, spotsLeft: Math.max(event.capacity - registered, 0) };
      });
    },

    async create(data) {
      const event = await events.create(data);
      cache.clear();
      return event;
    },

    async update(id, data) {
      const event = await events.update(id, data);
      if (!event) throw notFound(`Event with id ${id} not found`);
      cache.clear();
      return event;
    },

    async remove(id) {
      const deleted = await events.remove(id);
      if (!deleted) throw notFound(`Event with id ${id} not found`);
      cache.clear();
    }
  };
}
