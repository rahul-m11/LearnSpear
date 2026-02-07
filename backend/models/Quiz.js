const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswer: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    questions: [questionSchema],
    rewards: {
      firstTry: {
        type: Number,
        default: 10,
      },
      secondTry: {
        type: Number,
        default: 7,
      },
      thirdTry: {
        type: Number,
        default: 5,
      },
      fourthTry: {
        type: Number,
        default: 2,
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
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

module.exports = mongoose.model('Quiz', quizSchema);
