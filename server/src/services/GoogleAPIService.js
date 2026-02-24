import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const GENERATION_CONFIG = {
  temperature: 0.3,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

const validateCard = (card, index) => {
  const errors = [];

  if (
    !card.front ||
    typeof card.front !== 'string' ||
    card.front.trim().length < 3
  ) {
    errors.push(`Card ${index + 1}: Front must be at least 3 characters`);
  }
  if (
    !card.back ||
    typeof card.back !== 'string' ||
    card.back.trim().length < 3
  ) {
    errors.push(`Card ${index + 1}: Back must be at least 3 characters`);
  }
  if (![1, 2, 3].includes(Number(card.difficulty))) {
    errors.push(`Card ${index + 1}: Difficulty must be 1, 2, or 3`);
  }

  return errors;
};

export const generateCardsFromNotes = async (
  notes,
  category = 'general',
  count = 5,
) => {
  if (!notes || typeof notes !== 'string' || notes.trim().length < 10) {
    throw new AppError('Notes must be at least 10 characters long', 400);
  }

  if (count < 1 || count > 20) {
    throw new AppError('Card count must be between 1 and 20', 400);
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-001',
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  });

  const prompt = `Create ${count} flashcards from these study notes. Return a JSON object with a "cards" array.

STUDY NOTES:
${notes.slice(0, 10000)}

CATEGORY: ${category || 'general'}

REQUIREMENTS:
- Each card must have: front (question), back (answer), difficulty (1-3)
- Front: Clear, specific question (max 255 chars)
- Back: Concise answer with key facts only (max 500 chars)
- Difficulty: 1 (basic recall), 2 (understanding), 3 (application/analysis)
- Ensure questions test understanding, not just memorization

JSON SCHEMA:
{
  "cards": [
    {
      "front": "string",
      "back": "string",
      "difficulty": 1
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (response.promptFeedback?.blockReason) {
      throw new AppError(
        `Content blocked: ${response.promptFeedback.blockReason}. Please check your notes for inappropriate content.`,
        400,
      );
    }

    const text = response.text();
    let parsed;

    // Parse JSON with multiple fallback strategies
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('No JSON object found in response');
        }
      }
    }

    const rawCards = Array.isArray(parsed)
      ? parsed
      : parsed.cards || parsed.flashcards || [];

    if (!rawCards.length) {
      throw new AppError(
        'No cards were generated. Try providing more detailed notes.',
        422,
      );
    }

    // Validate and sanitize cards
    const validatedCards = [];
    const errors = [];

    rawCards.forEach((card, idx) => {
      const cardErrors = validateCard(card, idx);
      if (cardErrors.length) {
        errors.push(...cardErrors);
      } else {
        validatedCards.push({
          front: card.front.trim().slice(0, 255),
          back: card.back.trim().slice(0, 500),
          difficulty: Number(card.difficulty),
          category: (category || 'general').toLowerCase().trim(),
          tags: [(category || 'general').toLowerCase().trim()].filter(Boolean),
          createdAt: new Date().toISOString(),
          source: 'ai-generated',
        });
      }
    });

    if (validatedCards.length === 0) {
      throw new AppError(`Card validation failed: ${errors.join(', ')}`, 422);
    }

    return {
      cards: validatedCards,
      generatedCount: rawCards.length,
      validCount: validatedCards.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    // Handle specific Gemini API errors
    if (error.message?.includes('429') || error.status === 429) {
      throw new AppError(
        'Rate limit exceeded. Please wait a moment and try again.',
        429,
      );
    }
    if (error.message?.includes('503') || error.status === 503) {
      throw new AppError(
        'AI service temporarily unavailable. Please try again.',
        503,
      );
    }
    if (error.message?.includes('401') || error.message?.includes('403')) {
      throw new AppError(
        'AI service authentication failed. Contact support.',
        500,
      );
    }

    // If it's already an AppError, rethrow it
    if (error.isOperational) {
      throw error;
    }

    console.error('Gemini API Error:', error);
    throw new AppError(
      error.message || 'Failed to generate cards. Please try again.',
      500,
    );
  }
};

// Batch generation for multiple topics
export const generateCardsBatch = async (
  topics,
  category = 'general',
  cardsPerTopic = 3,
) => {
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new AppError('Topics must be a non-empty array', 400);
  }

  if (topics.length > 5) {
    throw new AppError('Maximum 5 topics allowed per batch', 400);
  }

  const promises = topics.map((topic, index) =>
    generateCardsFromNotes(topic, category, cardsPerTopic)
      .then((result) => ({ status: 'fulfilled', value: result, index }))
      .catch((error) => ({
        status: 'rejected',
        reason: error,
        index,
        topic: topic.slice(0, 50),
      })),
  );

  const results = await Promise.all(promises);

  return results.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        acc.cards.push(...result.value.cards);
        acc.successful.push(result.index);
      } else {
        acc.errors.push({
          index: result.index,
          topic: result.topic,
          error: result.reason.message,
        });
      }
      return acc;
    },
    { cards: [], successful: [], errors: [] },
  );
};
