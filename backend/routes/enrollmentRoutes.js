const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
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
    if (decoded.role !== 'admin' && decoded.role !== 'instructor') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all enrollments for a course
router.get('/course/:courseId', verifyAdminToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
      .populate('userId', 'name email avatar')
      .populate('courseId', 'title price');

    res.status(200).json({
      message: 'Enrollments retrieved successfully',
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enrollment by user and course
router.get('/:userId/:courseId', verifyAdminToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      userId: req.params.userId,
      courseId: req.params.courseId,
    }).populate('userId', 'name email');

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.status(200).json({
      message: 'Enrollment retrieved successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create enrollment
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ error: 'User ID and course ID are required' });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({ userId, courseId });
    if (enrollment) {
      return res.status(400).json({ error: 'User already enrolled in this course' });
    }

    enrollment = new Enrollment({
      userId,
      courseId,
      status: 'not-started',
      progress: 0,
    });

    await enrollment.save();

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enrollment
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { status, progress, completedLessons, startDate, completedDate, timeSpent } = req.body;

    let enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (status) enrollment.status = status;
    if (progress !== undefined) enrollment.progress = progress;
    if (completedLessons) enrollment.completedLessons = completedLessons;
    if (startDate) enrollment.startDate = startDate;
    if (completedDate) enrollment.completedDate = completedDate;
    if (timeSpent !== undefined) enrollment.timeSpent = timeSpent;

    enrollment.updatedAt = Date.now();
    await enrollment.save();

    res.status(200).json({
      message: 'Enrollment updated successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete enrollment
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.status(200).json({
      message: 'Enrollment deleted successfully',
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
