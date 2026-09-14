export function notFoundError(message = 'Not found') {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

export function badRequestError(message = 'Bad request') {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export function conflictError(message = 'Conflict') {
  const err = new Error(message);
  err.statusCode = 409;
  return err;
}

// Formats a Zod safeParse failure into one readable message — used by
// every new write-endpoint controller in Phase 9.3, so validation error
// shape stays consistent instead of each controller rolling its own.
export function zodBadRequest(zodResult) {
  return badRequestError(zodResult.error.issues.map((i) => i.message).join('; '));
}
