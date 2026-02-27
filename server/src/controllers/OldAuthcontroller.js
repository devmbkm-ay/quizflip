// import Card from '../models/Card.js';
// import asyncHandler from '../utils/asyncHandler.js';
// import { NotFoundError } from '../utils/errors.js';
// import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

// export const getOne = asyncHandler(async (req, res) => {
//   const card = await Card.findById(req.params.id);

//   if (!card) {
//     // Propre, simple, typé.
//     throw new NotFoundError(`No card found with ID ${req.params.id}`);
//   }

//   // Vérification de propriété
//   if (card.user.toString() !== req.user.id) {
//     throw new UnauthorizedError('You do not have permission to view this card');
//   }

//   res.json({ success: true, data: card });
// });
