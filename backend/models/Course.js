const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'document', 'image', 'quiz'],
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  duration: {
    type: Number,
    default: 0,
  },
  allowDownload: {
    type: Boolean,
    default: false,
  },
  attachments: [
    {
      type: {
        type: String,
        enum: ['file', 'link'],
      },
      name: String,
      url: String,
    },
  ],
  responsibleId: mongoose.Schema.Types.ObjectId,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    tags: [String],
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    },
    website: String,
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['everyone', 'signed-in'],
      default: 'everyone',
    },
    access: {
      type: String,
      enum: ['open', 'invitation', 'payment'],
      default: 'open',
    },
    price: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    lessons: [lessonSchema],
    attendees: [
      {
        email: String,
        invitedDate: {
          type: Date,
          default: Date.now,
        },
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

module.exports = mongoose.model('Course', courseSchema);
