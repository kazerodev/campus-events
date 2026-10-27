import { validationError } from '../errors/AppError.mjs';

function toDetails(error, part) {
  return error.issues.map((issue) => ({ field: issue.path.join('.') || part, message: issue.message }));
}

export function validate(schemas) {
  return (req, res, next) => {
    req.valid = {};
    for (const part of ['params', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) {
        return next(validationError(toDetails(result.error, part)));
      }
      req.valid[part] = result.data;
    }
    next();
  };
}
