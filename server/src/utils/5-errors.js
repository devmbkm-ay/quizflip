// server/src/middleware/error.js
import { AppError } from './5-errors.js';

const errorHandler = (err, req, res, next) => {
  // Par défaut, on part sur une erreur 500
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // LOGIQUE NINJA : On identifie le type d'erreur

  // 1. Si c'est une de TES classes personnalisées (AppError, NotFoundError, etc.)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 2. Gestion spécifique des erreurs Mongoose (qui n'utilisent pas tes classes)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered (Already exists)';
  }

  // 3. Log de l'erreur pour le debug (uniquement en développement)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR ❌] ${err.stack}`);
  }

  // Envoi de la réponse formatée
  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    message: message,
    // On n'envoie la stack trace qu'en dev pour ne pas donner d'infos aux hackers
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
