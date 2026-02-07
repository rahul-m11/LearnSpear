const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT and check admin role
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

// Get all courses (admin view - includes all courses)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const courses = await Course.find().populate('responsibleId', 'name email').populate('adminId', 'name email');
    res.status(200).json({
      message: 'Courses retrieved successfully',
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('responsibleId', 'name email').populate('adminId', 'name email');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({
      message: 'Course retrieved successfully',
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, tags, image, website, price, visibility, access } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const course = new Course({
      title,
      description,
      tags: tags || [],
      image: image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      website: website || '',
      responsibleId: req.userId,
      adminId: req.userId,
      price: price || 0,
      visibility: visibility || 'everyone',
      access: access || 'open',
      published: false,
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, tags, image, website, price, visibility, access, published } = req.body;

    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (tags) course.tags = tags;
    if (image) course.image = image;
    if (website !== undefined) course.website = website;
    if (price !== undefined) course.price = price;
    if (visibility) course.visibility = visibility;
    if (access) course.access = access;
    if (published !== undefined) course.published = published;

    course.updatedAt = Date.now();
    await course.save();

    res.status(200).json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete courses' });
    }

    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({
      message: 'Course deleted successfully',
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add lesson to course
router.post('/:id/lessons', verifyAdminToken, async (req, res) => {
  try {
    const { title, type, description, url, duration, allowDownload } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = {
      title,
      type,
      description: description || '',
      url: url || '',
      duration: duration || 0,
      allowDownload: allowDownload || false,
      attachments: [],
      responsibleId: req.userId,
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({
      message: 'Lesson added successfully',
      lesson: course.lessons[course.lessons.length - 1],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lesson
router.put('/:courseId/lessons/:lessonId', verifyAdminToken, async (req, res) => {
  try {
    const { title, type, description, url, duration, allowDownload } = req.body;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (title) lesson.title = title;
    if (type) lesson.type = type;
    if (description) lesson.description = description;
    if (url) lesson.url = url;
    if (duration !== undefined) lesson.duration = duration;
    if (allowDownload !== undefined) lesson.allowDownload = allowDownload;

    await course.save();

    res.status(200).json({
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson
router.delete('/:courseId/lessons/:lessonId', verifyAdminToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lesson.deleteOne();
    await course.save();

    res.status(200).json({
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
