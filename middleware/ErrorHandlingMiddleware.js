const ApiError = require('../error/ApiError');
const { createLogger, transports } = require('winston');
const logger = createLogger({
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

module.exports = function(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({message: err.message, errors: err.errors});
  }

  logger.error(`Error: ${err.message}\nStack: ${err.stack})`);
  return res.status(500).json({message: 'Непредвиденная ошибка'});
}