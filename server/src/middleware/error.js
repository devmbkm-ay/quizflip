// server/src/middleware/error.js
import { AppError } from '../utils/errors.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Si c'est une erreur que nous avons définie (NotFoundError, etc.)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Erreur de format d'ID MongoDB (ex: ID trop court)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found (Invalid ID format)';
  }

  // Erreur de doublon MongoDB (ex: email déjà pris)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Log de l'erreur dans la console Docker pour nous
  console.error(`[Ninja Error]: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
    // On n'affiche la pile d'exécution qu'en développement
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
