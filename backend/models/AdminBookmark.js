const mongoose = require('mongoose');

const adminBookmarkSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    courseLiked: {
      type: Boolean,
      default: false,
    },
    courseBookmarked: {
      type: Boolean,
      default: false,
    },
    notes: String,
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

// Unique constraint: one bookmark record per admin-course combination
adminBookmarkSchema.index({ adminId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('AdminBookmark', adminBookmarkSchema);
