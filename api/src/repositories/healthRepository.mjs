import { sequelize } from '../models/index.mjs';

export const healthRepository = {
  async ping() {
    await sequelize.authenticate();
  }
};
