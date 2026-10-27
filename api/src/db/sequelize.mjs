import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import { config } from '../config/env.mjs';

if (config.dbStorage !== ':memory:') {
  fs.mkdirSync(path.dirname(config.dbStorage), { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.dbStorage,
  logging: false
});
