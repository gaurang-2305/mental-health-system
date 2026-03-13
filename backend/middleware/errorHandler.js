const logger = require('../utils/index');

function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);

  // Supabase / Postgres errors
  if (err.code === 'PGRST116') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry — resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  // Validation errors (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({ error: 'Validation failed', details: err.details });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : (err.message || 'Something went wrong'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };