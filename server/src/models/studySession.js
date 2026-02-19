// server/src/models/StudySession.js
const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    wasCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      // in seconds
      type: Number,
      min: 0,
    },
    studyMode: {
      type: String,
      enum: ['flip', 'quiz', 'spaced'],
      default: 'flip',
    },
  },
  { timestamps: true },
);

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
