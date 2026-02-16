export class ApiError extends Error {
  constructor(statusCode, message, code = 'GENERIC_ERROR', details = null) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
