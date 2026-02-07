# LearnSphere Backend API

Backend server for the LearnSphere eLearning platform with MongoDB database integration for admin operations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   The `.env` file is already configured with default values:
   ```
   MONGODB_URI=mongodb://localhost:27017/learnsphere
   JWT_SECRET=your-secret-key-change-in-production
   PORT=5000
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas - update MONGODB_URI in .env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnsphere
   ```

4. **Start Backend Server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

   Server will be available at: `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Admin User Management (`/api/admin/users`)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/role/:role` - Get users by role
- `GET /api/admin/users/:id` - Get single user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/stats/summary` - Get user statistics

### Course Management (`/api/admin/courses`)
- `GET /api/admin/courses` - List all courses
- `GET /api/admin/courses/:id` - Get course details
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/courses/:id/lessons` - Add lesson
- `PUT /api/admin/courses/:courseId/lessons/:lessonId` - Update lesson
- `DELETE /api/admin/courses/:courseId/lessons/:lessonId` - Delete lesson

### Quiz Management (`/api/admin/quizzes`)
- `GET /api/admin/quizzes/course/:courseId` - Get quizzes for course
- `GET /api/admin/quizzes/:id` - Get quiz details
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/:id` - Update quiz
- `DELETE /api/admin/quizzes/:id` - Delete quiz

### Enrollment Management (`/api/admin/enrollments`)
- `GET /api/admin/enrollments/course/:courseId` - Get course enrollments
- `GET /api/admin/enrollments/:userId/:courseId` - Get single enrollment
- `POST /api/admin/enrollments` - Create enrollment
- `PUT /api/admin/enrollments/:id` - Update enrollment
- `DELETE /api/admin/enrollments/:id` - Delete enrollment

### Analytics Dashboard (`/api/admin/analytics`)
- `GET /api/admin/analytics/dashboard` - Dashboard statistics
- `GET /api/admin/analytics/courses/performance` - Course performance metrics
- `GET /api/admin/analytics/revenue/monthly` - Monthly revenue breakdown
- `GET /api/admin/analytics/learners/progress` - Learner progress tracking

### Admin Bookmarks (`/api/admin/bookmarks`)
- `GET /api/admin/bookmarks` - Get all bookmarks
- `GET /api/admin/bookmarks/bookmarked-courses` - Get bookmarked courses
- `POST /api/admin/bookmarks/toggle-bookmark/:courseId` - Toggle bookmark
- `POST /api/admin/bookmarks/toggle-like/:courseId` - Toggle like status
- `DELETE /api/admin/bookmarks/:courseId` - Remove bookmark

## 🔐 Authentication

All admin routes require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Token is obtained via login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 📊 Database Models

### User
- Stores authentication, profile, and role information
- Roles: admin, instructor, learner
- Password hashing with bcryptjs

### Course
- Contains course metadata, lessons, pricing
- Nested lesson schema with multiple content types
- References to instructor and admin

### Quiz
- Quiz questions with multiple choice options
- Reward points for different attempt numbers
- Associated with specific courses

### Enrollment
- Tracks student enrollment status
- Progress monitoring and completion tracking
- Quiz attempt records

### AdminBookmark
- Admin-specific course preferences
- Separate like and bookmark tracking
- Notes field for admin comments

## ⚙️ Key Features

✅ JWT-based authentication
✅ Role-based access control (admin/instructor/learner)
✅ Secure password hashing with bcryptjs
✅ MongoDB persistence
✅ CORS enabled for frontend communication
✅ Comprehensive error handling
✅ Admin-only protected routes
✅ Revenue tracking and analytics
✅ Student progress monitoring
✅ Bookmark and like system

## 🤝 Integration with Frontend

Update the frontend API calls to use:
```javascript
const API_URL = 'http://localhost:5000/api';

// Login example
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
  // Store user info and proceed to dashboard
})
```

## 📝 Sample Admin Flow

1. **Register/Login**
   ```bash
   POST /api/auth/login
   ```

2. **Create Course**
   ```bash
   POST /api/admin/courses
   ```

3. **Add Quiz to Course**
   ```bash
   POST /api/admin/quizzes
   ```

4. **Track Analytics**
   ```bash
   GET /api/admin/analytics/dashboard
   ```

5. **Manage Bookmarks**
   ```bash
   POST /api/admin/bookmarks/toggle-bookmark/:courseId
   ```

## 🐛 Troubleshooting

**MongoDB Connection Failed**
- Ensure MongoDB is running locally or update MONGODB_URI in .env
- Check firewall settings for MongoDB port (27017)

**Port Already in Use**
- Change PORT in .env file
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

**Token Invalid**
- Ensure Authorization header format: `Bearer <token>`
- Verify JWT_SECRET in .env matches the one used for token creation

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-Origin Resource Sharing
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **validator** - Data validation
- **nodemon** - Development server with auto-reload

## 🔗 Related Documentation

- [Frontend README](../README.md)
- [API Response Format](./API_RESPONSES.md)
- [Database Schema](./DATABASE_SCHEMA.md)
