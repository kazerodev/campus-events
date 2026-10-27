import { AppError } from '../errors/AppError.mjs';
import { logger } from '../utils/logger.mjs';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
}

// Express recognises an error handler by its FOUR parameters.
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    const { code, message, details } = err;
    return res.status(err.status).json({ error: details ? { code, message, details } : { code, message } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' } });
  }
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
}
