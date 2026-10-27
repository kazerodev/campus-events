import { sequelize } from '../db/sequelize.mjs';
import { Event } from './event.mjs';
import { Registration } from './registration.mjs';

Event.hasMany(Registration, { foreignKey: { name: 'eventId', allowNull: false }, onDelete: 'CASCADE' });
Registration.belongsTo(Event, { foreignKey: 'eventId' });

export { sequelize, Event, Registration };
