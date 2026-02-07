const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access analytics' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get dashboard statistics
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    // Overall statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ published: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const totalLearners = await User.countDocuments({ role: 'learner' });

    // Revenue calculation
    const paidCourses = await Course.find({ access: 'payment', price: { $gt: 0 } });
    let totalRevenue = 0;
    for (const course of paidCourses) {
      const enrollments = await Enrollment.countDocuments({ courseId: course._id });
      totalRevenue += course.price * enrollments;
    }

    // Completion rate
    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    res.status(200).json({
      message: 'Analytics retrieved successfully',
      stats: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        totalLearners,
        totalRevenue,
        completionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course performance
router.get('/courses/performance', verifyAdminToken, async (req, res) => {
  try {
    const courses = await Course.find({ published: true });
    const performances = [];

    for (const course of courses) {
      const enrollments = await Enrollment.find({ courseId: course._id });
      const completed = enrollments.filter((e) => e.status === 'completed').length;
      const revenue =
        course.access === 'payment'
          ? course.price * enrollments.length
          : 0;

      performances.push({
        courseId: course._id,
        title: course.title,
        enrollments: enrollments.length,
        completed,
        completionRate:
          enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
        revenue,
        views: course.views || 0,
      });
    }

    res.status(200).json({
      message: 'Course performance retrieved successfully',
      performances: performances.sort((a, b) => b.revenue - a.revenue),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly revenue
router.get('/revenue/monthly', verifyAdminToken, async (req, res) => {
  try {
    const courses = await Course.find({ access: 'payment', price: { $gt: 0 } });
    const monthlyRevenue = {};

    for (const course of courses) {
      const enrollments = await Enrollment.find({ courseId: course._id });

      for (const enrollment of enrollments) {
        const month = new Date(enrollment.enrolledDate).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });

        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += course.price;
      }
    }

    res.status(200).json({
      message: 'Monthly revenue retrieved successfully',
      data: monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get learner progress
router.get('/learners/progress', verifyAdminToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    res.status(200).json({
      message: 'Learner progress retrieved successfully',
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
