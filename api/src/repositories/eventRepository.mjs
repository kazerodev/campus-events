import { Event } from '../models/index.mjs';

export const eventRepository = {
  async findAll() {
    const events = await Event.findAll({ order: [['startsAt', 'ASC']] });
    return events.map((event) => event.toJSON());
  },

  async findById(id) {
    const event = await Event.findByPk(id);
    return event ? event.toJSON() : null;
  },

  async count() {
    return Event.count();
  },

  async create(data) {
    const event = await Event.create(data);
    return event.toJSON();
  },

  async update(id, data) {
    const event = await Event.findByPk(id);
    if (!event) return null;
    await event.update(data);
    return event.toJSON();
  },

  async remove(id) {
    const deleted = await Event.destroy({ where: { id } });
    return deleted > 0;
  }
};
