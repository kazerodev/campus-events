export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message) => new AppError(404, 'NOT_FOUND', message);

export const conflict = (message) => new AppError(409, 'CONFLICT', message);

export const validationError = (details) => new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details);
