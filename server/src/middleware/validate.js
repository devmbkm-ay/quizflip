import { validationResult } from 'express-validator';

/**
 * LOGIQUE NINJA : Un pont entre express-validator et tes contrôleurs.
 * Il vérifie s'il y a des erreurs de validation et les renvoie
 * avant même que le contrôleur ne soit sollicité.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
