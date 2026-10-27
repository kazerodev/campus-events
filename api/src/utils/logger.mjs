import { createLogger, format, transports } from 'winston';
import { config } from '../config/env.mjs';

export const logger = createLogger({
  level: config.logLevel,
  silent: config.isTest,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()]
});
