const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'timed-out', 'discontinued'],
      default: 'not-started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: [mongoose.Schema.Types.ObjectId],
    enrolledDate: {
      type: Date,
      default: Date.now,
    },
    startDate: Date,
    completedDate: Date,
    timeSpent: {
      type: Number,
      default: 0,
    },
    quizAttempts: [
      {
        quizId: mongoose.Schema.Types.ObjectId,
        score: Number,
        attempts: Number,
        completedAt: Date,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique constraint: one enrollment per user-course combination
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
