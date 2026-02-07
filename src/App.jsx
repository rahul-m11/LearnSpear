import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import LearnerLayout from './layouts/LearnerLayout';

// Admin/Instructor Pages
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import ReportingDashboard from './pages/admin/ReportingDashboard';
import CoursesDashboard from './pages/admin/CoursesDashboard';
import CourseForm from './pages/admin/CourseForm';
import QuizBuilder from './pages/admin/QuizBuilder';

// Learner Pages
import MyCourses from './pages/learner/MyCourses';
import CourseDetail from './pages/learner/CourseDetail';
import LessonPlayer from './pages/learner/LessonPlayer';
import Profile from './pages/learner/Profile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  const { user } = useApp();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin/Instructor Routes */}
      {user && (user.role === 'admin' || user.role === 'instructor') && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AnalyticsDashboard />} />
          <Route path="reporting" element={<ReportingDashboard />} />
          <Route path="courses" element={<CoursesDashboard />} />
          <Route path="courses/:courseId" element={<CourseForm />} />
          <Route path="courses/:courseId/quiz/:quizId" element={<QuizBuilder />} />
        </Route>
      )}

      {/* Learner Routes */}
      <Route path="/" element={<LearnerLayout />}>
        <Route index element={<MyCourses />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Lesson Player - Full Screen */}
      <Route path="/learn/:courseId/:lessonId" element={<LessonPlayer />} />

      {/* Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
