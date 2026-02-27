import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: [true, 'Front content is required'],
      trim: true,
      maxlength: [500, 'Front cannot exceed 500 characters'],
    },
    back: {
      type: String,
      required: [true, 'Back content is required'],
      trim: true,
      maxlength: [1000, 'Back cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    difficulty: {
      type: Number,
      enum: {
        values: [1, 2, 3],
        message: 'Difficulty must be 1 (Easy), 2 (Medium), or 3 (Hard)',
      },
      default: 2,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewStats: {
      timesReviewed: { type: Number, default: 0 },
      timesCorrect: { type: Number, default: 0 },
      lastReviewed: { type: Date, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for mastery percentage
cardSchema.virtual('mastery').get(function () {
  if (this.reviewStats.timesReviewed === 0) return 0;
  return Math.round(
    (this.reviewStats.timesCorrect / this.reviewStats.timesReviewed) * 100,
  );
});

// Index for faster queries
cardSchema.index({ category: 1, createdAt: -1 });
cardSchema.index({ tags: 1 });
cardSchema.index({ user: 1, isActive: 1, createdAt: -1 });
cardSchema.index({ user: 1, category: 1, isActive: 1 });
cardSchema.index(
  { user: 1, front: 1, back: 1, category: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

const Card = mongoose.model('Card', cardSchema);

export default Card;
