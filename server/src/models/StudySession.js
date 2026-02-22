// server/src/models/StudySession.js
import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false, // <-- CHANGED: Made optional
    },
    wasCorrect: {
      type: Boolean,
      required: true,
    },
    studyMode: {
      type: String,
      enum: ['flip', 'quiz', 'spaced', 'random'],
      default: 'random',
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

studySessionSchema.index({ userId: 1, createdAt: -1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;
