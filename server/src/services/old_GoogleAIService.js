import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const generateCardsFromNotes = async (notes, category = 'general') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create 3-5 flashcards from these study notes. Return ONLY a valid JSON array with this exact format:
[
  {"front": "question here", "back": "answer here", "difficulty": 1-3},
  ...
]

Notes: ${notes}

Category context: ${category}

Rules:
- Front should be a clear question
- Back should be a concise answer
- Difficulty: 1 (easy), 2 (medium), or 3 (hard)
- Return ONLY the JSON array, no markdown, no explanation`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ||
      text.match(/```\n?([\s\S]*?)\n?```/) || [null, text];

    const jsonString = jsonMatch[1] || text;
    const cards = JSON.parse(jsonString.trim());

    // Validate and clean
    return cards.map((card) => ({
      front: String(card.front).slice(0, 255),
      back: String(card.back).slice(0, 500),
      difficulty: [1, 2, 3].includes(Number(card.difficulty))
        ? Number(card.difficulty)
        : 2,
      category: category.toLowerCase(),
      tags: [],
    }));
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate cards. Please try again.');
  }
};

// Alternative: Streaming for real-time generation
export const generateCardsStream = async (notes, category, onChunk) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Create flashcards from: ${notes}`;

  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    onChunk(text);
  }
};
