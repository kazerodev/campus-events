import { notFound } from '../errors/AppError.mjs';

export function createEventService({ events, registrations, cache }) {
  return {
    list() {
      return cache.getOrSet('events', () => events.findAll());
    },

    async getById(id) {
      const event = await cache.getOrSet(`events:${id}`, async () => {
        const found = await events.findById(id);
        if (!found) return null;
        const registered = await registrations.countByEvent(id);
        return { ...found, registered, spotsLeft: Math.max(found.capacity - registered, 0) };
      });
      if (!event) throw notFound(`Event with id ${id} not found`);
      return event;
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
