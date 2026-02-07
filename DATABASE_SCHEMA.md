# LearnSphere Database Schema Documentation

Complete documentation of all MongoDB database models and their relationships.

---

## 📊 Database Overview

The LearnSphere database consists of 5 interconnected MongoDB collections designed specifically for the admin platform, covering all operations from user authentication to analytics tracking.

---

## 👤 User Model

**Collection:** `users`

Stores user accounts with authentication, profile information, and role-based access control.

### Schema
```javascript
{
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'instructor', 'learner'],
    default: 'learner'
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Methods
- `matchPassword(password)` - Compare plain password with hashed password
- Pre-save hook hashes password before storing

### Indexes
- Unique index on `email`
- Index on `role` for queries by user type

### Usage
```javascript
// Create user (password auto-hashed)
const user = new User({
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'plain_password',
  role: 'admin'
});

// Login verification
const isMatch = await user.matchPassword(passwordFromForm);

// Get all admins
const admins = await User.find({ role: 'admin' });
```

---

## 📚 Course Model

**Collection:** `courses`

Stores course content with lessons, pricing, and access control.

### Schema
```javascript
{
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  tags: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  access: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  published: {
    type: Boolean,
    default: false
  },
  lessons: [{
    type: {
      type: String,
      enum: ['video', 'document', 'image', 'quiz'],
      required: true
    },
    title: String,
    duration: Number,  // in minutes
    url: String,
    attachments: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  responsibleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Nested Lesson Schema
Each lesson contains:
- `type` - Type of content (video/document/image/quiz)
- `title` - Lesson title
- `duration` - Minutes to complete
- `url` - Content URL
- `attachments` - Array of file URLs
- `createdAt` - Creation timestamp

### References
- `responsibleId` → User (instructor who created course)
- `adminId` → User (admin who manages course)

### Indexes
- Index on `published` for filtering
- Index on `adminId` for admin queries
- Text index on `title` and `tags` for search

### Usage
```javascript
// Create course with lessons
const course = new Course({
  title: 'React Fundamentals',
  description: 'Learn React basics',
  price: 49.99,
  access: 'paid',
  lessons: [
    {
      type: 'video',
      title: 'Intro to React',
      duration: 30,
      url: 'https://video.com/react-intro',
      attachments: ['setup.pdf']
    }
  ],
  responsibleId: instructorId,
  adminId: adminId
});

// Get course with instructor details
const courseWithInstructor = await Course.findById(courseId)
  .populate('responsibleId', 'name email');

// Get all published courses
const published = await Course.find({ published: true });

// Search courses by tags
const courses = await Course.find({ tags: 'javascript' });
```

---

## 🎯 Quiz Model

**Collection:** `quizzes`

Stores quiz questions and reward point configurations for courses.

### Schema
```javascript
{
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: String,
  questions: [{
    text: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 6,
        message: 'Provide 2-6 options'
      }
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    explanation: String  // Answer explanation for learning
  }],
  rewards: {
    firstTry: {
      type: Number,
      default: 100,
      min: 0
    },
    secondTry: {
      type: Number,
      default: 75,
      min: 0
    },
    thirdTry: {
      type: Number,
      default: 50,
      min: 0
    },
    fourthTry: {
      type: Number,
      default: 25,
      min: 0
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Nested Question Schema
Each question has:
- `text` - Question text
- `options` - Array of 2-6 answer choices
- `correctAnswer` - Index of correct option
- `explanation` - Learning explanation

### Reward System
Points awarded based on number of attempts:
- **First Try** - 100 points
- **Second Try** - 75 points
- **Third Try** - 50 points
- **Fourth Try+** - 25 points

### References
- `courseId` → Course (the quiz belongs to this course)

### Indexes
- Index on `courseId` for course-specific queries
- Index on `isPublished` for filtering

### Usage
```javascript
// Create quiz with questions
const quiz = new Quiz({
  courseId: courseId,
  title: 'JavaScript Fundamentals Quiz',
  questions: [
    {
      text: 'What is a closure?',
      options: ['A, B', 'C', 'D', 'E'],
      correctAnswer: 0,
      explanation: 'A closure is...'
    }
  ],
  rewards: {
    firstTry: 100,
    secondTry: 75,
    thirdTry: 50,
    fourthTry: 25
  },
  isPublished: true
});

// Get quiz with course details
const quizWithCourse = await Quiz.findById(quizId)
  .populate('courseId', 'title');

// Get all quizzes for a course
const quizzes = await Quiz.find({ courseId: courseId });
```

---

## 📋 Enrollment Model

**Collection:** `enrollments`

Tracks student enrollments, progress, and completion status.

### Schema
```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'timed-out', 'discontinued'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  enrolledDate: {
    type: Date,
    default: Date.now
  },
  startDate: Date,
  completedDate: Date,
  timeSpent: {
    type: Number,
    default: 0  // in minutes
  },
  quizAttempts: [{
    quizId: mongoose.Schema.Types.ObjectId,
    attempts: Number,
    score: Number,
    attemptDate: Date
  }],
  notes: String
}
```

### Status Progression
- `not-started` → Initial enrollment state
- `in-progress` → Student has started lessons
- `completed` → All requirements met
- `timed-out` → Enrollment expired
- `discontinued` → Student withdrew

### Tracking Fields
- `progress` - Percentage completion (0-100)
- `completedLessons` - Array of lesson IDs completed
- `timeSpent` - Total minutes spent on course
- `quizAttempts` - Track quiz performance

### References
- `userId` → User (the enrolled student)
- `courseId` → Course (the enrolled course)
- `quizAttempts.quizId` → Quiz (quiz results)

### Constraints
- Unique compound index on `userId + courseId` (one enrollment per student per course)

### Usage
```javascript
// Create enrollment
const enrollment = new Enrollment({
  userId: studentId,
  courseId: courseId,
  status: 'not-started'
});

// Update progress
enrollment.progress = 50;
enrollment.status = 'in-progress';
enrollment.completedLessons.push(lessonId);
enrollment.timeSpent += 30;

// Get student enrollments
const studentCourses = await Enrollment.find({ userId: studentId })
  .populate('courseId', 'title image');

// Get course enrollments (for admin analytics)
const courseEnrollments = await Enrollment.find({ courseId: courseId });

// Calculate completion rate
const completed = await Enrollment.countDocuments({
  courseId: courseId,
  status: 'completed'
});
const total = await Enrollment.countDocuments({ courseId: courseId });
const completionRate = (completed / total) * 100;
```

---

## 🔖 AdminBookmark Model

**Collection:** `adminbookmarks`

Stores admin-specific course preferences (likes and bookmarks).

### Schema
```javascript
{
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseLiked: {
    type: Boolean,
    default: false
  },
  courseBookmarked: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Purpose
Separate admin preferences from learner functionality:
- ✅ Admins can bookmark courses for quick reference
- ✅ Admins can like courses they prefer
- ✅ Admins can add notes to courses
- ❌ Does NOT affect learner bookmarks or likes

### References
- `adminId` → User (admin who created bookmark)
- `courseId` → Course (the bookmarked course)

### Constraints
- Unique compound index on `adminId + courseId`

### Boolean Flags
- `courseLiked` - Whether admin likes this course
- `courseBookmarked` - Whether course is bookmarked

### Usage
```javascript
// Create/toggle bookmark
const bookmark = await AdminBookmark.findOneAndUpdate(
  { adminId: adminId, courseId: courseId },
  { courseBookmarked: true },
  { upsert: true, new: true }
);

// Get admin's bookmarked courses
const bookmarked = await AdminBookmark.find({
  adminId: adminId,
  courseBookmarked: true
}).populate('courseId', 'title image price');

// Get admin's liked courses
const liked = await AdminBookmark.find({
  adminId: adminId,
  courseLiked: true
}).populate('courseId', 'title');

// Toggle like status
await AdminBookmark.findOneAndUpdate(
  { adminId: adminId, courseId: courseId },
  [{ $set: { courseLiked: { $not: '$courseLiked' } } }],
  { upsert: true, new: true }
);
```

---

## 🔗 Relationships Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      USER                                │
│  (name, email, password, role, points, isActive)        │
└─────────────────────────────────────────────────────────┘
           ▲              ▲              ▲
           │              │              │
    [instructorId]   [adminId]    [adminId/userId]
           │              │              │
      ┌────┴──────────────┴──────────────┴─────┐
      │                                        │
      │    ┌─────────────┐          ┌──────────────────┐
      │    │   COURSE    │          │  ENROLLMENT      │
      │    │ (title,     │          │  (userId,        │
      │    │  lessons,   │◄─────────│   courseId,      │
      │    │  price)     │  course  │   progress,      │
      │    └─────────────┘          │   status)        │
      │           │                 └──────────────────┘
      │           │ course              ▲
      │           │                     │ course
      │    ┌──────▼──────────┐     ┌────┴─────────────────┐
      │    │  QUIZ           │     │  ADMINBOOKMARK       │
      │    │  (questions,    │     │  (courseLiked,       │
      │    │   rewards,      │     │   courseBookmarked,  │
      │    │   attempts)     │     │   notes)             │
      │    └─────────────────┘     └──────────────────────┘
      │
      └─────────────── Referenced by multiple relationships
```

---

## 📊 Query Examples

### Dashboard Statistics
```javascript
// Total statistics
const stats = {
  totalCourses: await Course.countDocuments(),
  totalUsers: await User.countDocuments(),
  totalEnrollments: await Enrollment.countDocuments(),
  activeEnrollments: await Enrollment.countDocuments({ 
    status: 'in-progress' 
  }),
};

// Revenue calculation
const revenue = await Course.aggregate([
  {
    $lookup: {
      from: 'enrollments',
      localField: '_id',
      foreignField: 'courseId',
      as: 'enrollments'
    }
  },
  {
    $project: {
      title: 1,
      price: 1,
      enrollmentCount: { $size: '$enrollments' },
      totalRevenue: { 
        $multiply: ['$price', { $size: '$enrollments' }] 
      }
    }
  }
]);
```

### Performance Metrics
```javascript
// Course performance
const performance = await Course.findById(courseId)
  .then(course => Enrollment.find({ courseId: course._id }))
  .then(enrollments => ({
    totalEnrolled: enrollments.length,
    completionRate: (enrollments.filter(e => 
      e.status === 'completed'
    ).length / enrollments.length * 100).toFixed(2),
    avgProgress: (enrollments.reduce((sum, e) => 
      sum + e.progress, 0) / enrollments.length).toFixed(0),
    avgTimeSpent: (enrollments.reduce((sum, e) => 
      sum + e.timeSpent, 0) / enrollments.length).toFixed(0) + ' min'
  }));
```

---

## 🔒 Security Features

✅ **Password Hashing** - Bcryptjs hashes all passwords
✅ **JWT Authentication** - Secure token-based auth
✅ **Role-Based Access** - admin/instructor/learner
✅ **Unique Email** - Prevents duplicate accounts
✅ **Input Validation** - Schema validators on all fields
✅ **Unique Constraints** - Prevents duplicate enrollments
✅ **Admin-Only Routes** - Middleware checks admin role

---

## 📈 Scalability Considerations

- **Indexes** on frequently queried fields
- **Compound indexes** for multi-field queries
- **Population limits** to avoid N+1 queries
- **Aggregation pipelines** for complex analytics
- **Database normalization** separates concerns

---

## 🔄 Future Enhancements

- Add certificate management collection
- Implement payment transaction tracking
- Add assignment submission collection
- Create discussion forum collection
- Add course rating and review collection

