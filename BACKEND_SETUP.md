# 🚀 LearnSphere Complete Setup Guide

Complete instructions for setting up and running the LearnSphere eLearning platform with backend database integration.

---

## 📋 What's Been Completed

### ✅ Backend Infrastructure
- **7 API Route Files**: Authentication, Users, Courses, Quizzes, Enrollments, Analytics, Bookmarks
- **5 Database Models**: User, Course, Quiz, Enrollment, AdminBookmark
- **Express Server**: Configured with MongoDB, CORS, JWT authentication, error handling
- **Admin-Only Routes**: All routes protected with JWT and admin role verification
- **Seed Database**: Sample data initialization script with test credentials

### ✅ Frontend Features
- Admin platform with dashboard, courses, quizzes, analytics
- Like/bookmark system for courses
- Time-based revenue analytics
- Context API for state management

---

## 🔧 Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express (web server)
- mongoose (MongoDB connection)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- cors (cross-origin requests)
- dotenv (environment variables)
- nodemon (auto-restart during development)

**Expected output:**
```
added 150 packages in 45s
```

---

## 🗄️ Step 2: Setup MongoDB

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB** from https://www.mongodb.com/try/download/community
2. **Start MongoDB service:**
   ```bash
   # Windows (PowerShell as Administrator)
   net start MongoDB
   
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. **Verify connection:**
   ```bash
   mongosh
   > show databases
   ```

The `.env` file already points to: `mongodb://localhost:27017/learnsphere`

### Option B: MongoDB Atlas (Cloud Database)

1. **Create account** at https://www.mongodb.com/cloud/atlas
2. **Create free cluster** (M0 tier)
3. **Get connection string** from Atlas dashboard
4. **Update .env file:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learnsphere
   ```

---

## 🌱 Step 3: Seed Sample Data

Initialize the database with test users and courses:

```bash
cd backend
npm run seed
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Admin user created
✅ Instructor user created
✅ Learner user 1 created
✅ Learner user 2 created
✅ Course 1 created
✅ Course 2 created
✅ Course 3 created

✅ Database seeding completed successfully!

Test Credentials:
Admin: admin@learnsphere.com / admin123456
Instructor: instructor@learnsphere.com / instructor123456
Learner: john@learnsphere.com / learner123456
Learner: sarah@learnsphere.com / learner123456
```

---

## 🚀 Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📝 API Documentation: http://localhost:5000/api
```

The backend is now running and ready to accept requests!

---

## 🌐 Step 5: Start Frontend (in a new terminal)

```bash
# From project root (not in backend folder)
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🧪 Step 6: Test the Setup

### Test Login (using curl or Postman)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@learnsphere.com",
    "password":"admin123456"
  }'
```

**Expected response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@learnsphere.com",
    "role": "admin",
    "points": 1000
  }
}
```

### Test in Web Browser

1. **Open** http://localhost:3000 (or http://localhost:5173)
2. **Login with:**
   - Email: `admin@learnsphere.com`
   - Password: `admin123456`
3. **Access Dashboard** - should see analytics, courses, quizzes

---

## 📊 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### Admin Users (Protected - Admin Only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/stats/summary` - User statistics

### Admin Courses (Protected - Admin Only)
- `GET /api/admin/courses` - List courses
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `POST /api/admin/courses/:id/lessons` - Add lesson

### Admin Analytics (Protected - Admin Only)
- `GET /api/admin/analytics/dashboard` - Dashboard stats
- `GET /api/admin/analytics/courses/performance` - Course metrics
- `GET /api/admin/analytics/revenue/monthly` - Revenue breakdown
- `GET /api/admin/analytics/learners/progress` - Learner progress

### Admin Bookmarks (Protected - Admin Only)
- `GET /api/admin/bookmarks` - Get bookmarks
- `POST /api/admin/bookmarks/toggle-bookmark/:courseId` - Bookmark course
- `POST /api/admin/bookmarks/toggle-like/:courseId` - Like course

---

## 🔐 How Authentication Works

1. **Admin logs in** with email/password
   ```
   POST /api/auth/login
   Response: { token: "jwt_token" }
   ```

2. **Token is stored** in frontend (localStorage or context)

3. **Token sent with requests** in Authorization header:
   ```
   Authorization: Bearer eyJhbGc...
   ```

4. **Backend verifies token** and checks admin role

5. **If valid** - request is processed
   **If invalid** - error 401 (unauthorized) or 403 (forbidden)

---

## 📂 Project Structure

```
LearnSpear/
├── src/                    (Frontend React code)
│   ├── App.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── pages/
│   │   ├── admin/         (Admin only)
│   │   └── learner/       (Learner only)
│   └── components/
│
├── backend/               (NEW - Backend API)
│   ├── models/            (Database schemas)
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Quiz.js
│   │   ├── Enrollment.js
│   │   └── AdminBookmark.js
│   │
│   ├── routes/            (API endpoints)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── bookmarkRoutes.js
│   │
│   ├── server.js          (Express app)
│   ├── package.json       (Dependencies)
│   ├── .env               (Configuration)
│   ├── seed.js            (Sample data)
│   └── README.md          (Backend docs)
│
├── package.json           (Frontend dependencies)
├── vite.config.js
└── README.md
```

---

## ⚠️ Troubleshooting

### MongoDB Connection Failed
```
❌ MongoDB connection error: connect ECONNREFUSED
```
**Solution:**
1. Ensure MongoDB is running: `mongosh`
2. Check MONGODB_URI in `.env` is correct
3. If using MongoDB Atlas, ensure IP whitelist includes your IP

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### Token Invalid Error
```
error: 'Invalid token'
```
**Solution:**
1. Ensure token is included in header: `Authorization: Bearer <token>`
2. Check JWT_SECRET in `.env` is correct
3. Token may have expired - login again to get new token

### CORS Error in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- CORS is already enabled in `server.js`
- Ensure backend URL in frontend is correct
- Check both frontend and backend are running

---

## 🎯 Next Steps

1. ✅ Install backend dependencies
2. ✅ Setup MongoDB (local or cloud)
3. ✅ Seed database with test data
4. ✅ Start backend server (npm run dev)
5. ✅ Start frontend server (npm run dev)
6. ✅ Login with test credentials
7. **Connect frontend to backend APIs** (update AppContext to use HTTP requests)
8. **Test all features** (create courses, view analytics, manage bookmarks)

---

## 📖 Additional Resources

- **Backend README**: [backend/README.md](./backend/README.md)
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js Docs**: https://expressjs.com/
- **JWT Auth**: https://jwt.io/
- **React Context**: https://react.dev/reference/react/useContext

---

## ✨ Features Overview

### Admin Platform
- 📊 **Analytics Dashboard** - Revenue & performance metrics
- 📚 **Course Management** - Create, edit, delete courses
- 📝 **Quiz Builder** - Create and manage quizzes
- 👥 **User Management** - View and manage all users
- 🎯 **Reporting** - Track learner progress
- 📌 **Bookmarks** - Like and bookmark courses

### Database Coverage
✅ User authentication and role management
✅ Course and lesson storage
✅ Quiz creation and tracking
✅ Student enrollments and progress
✅ Admin bookmarks and preferences
✅ Revenue analytics and metrics

---

## 🆘 Need Help?

1. Check error messages in terminal
2. Review logs in both frontend and backend
3. Verify all dependencies are installed
4. Ensure MongoDB is running
5. Confirm backend server is accessible at `http://localhost:5000/api/health`

---

**Happy learning! 🚀**
