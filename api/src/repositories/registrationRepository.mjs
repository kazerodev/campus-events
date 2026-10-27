import { Registration } from '../models/index.mjs';

export const registrationRepository = {
  async findByEvent(eventId) {
    const registrations = await Registration.findAll({ where: { eventId }, order: [['createdAt', 'ASC']] });
    return registrations.map((registration) => registration.toJSON());
  },

  countByEvent(eventId) {
    return Registration.count({ where: { eventId } });
  },

  async exists(eventId, email) {
    const registration = await Registration.findOne({ where: { eventId, email } });
    return registration !== null;
  },

  async create(data) {
    const registration = await Registration.create(data);
    return registration.toJSON();
  }
};
