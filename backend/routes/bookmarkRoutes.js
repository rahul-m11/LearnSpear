const express = require('express');
const router = express.Router();
const AdminBookmark = require('../models/AdminBookmark');
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
      return res.status(403).json({ error: 'Admin access only' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all bookmarks for admin
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const bookmarks = await AdminBookmark.find({ adminId: req.userId })
      .populate('courseId', 'title description image price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Bookmarks retrieved successfully',
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookmarked courses only
router.get('/bookmarked-courses', verifyAdminToken, async (req, res) => {
  try {
    const bookmarks = await AdminBookmark.find({
      adminId: req.userId,
      courseBookmarked: true,
    }).populate('courseId', 'title description image price tags lessons');

    res.status(200).json({
      message: 'Bookmarked courses retrieved successfully',
      count: bookmarks.length,
      courses: bookmarks.map((b) => b.courseId),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle bookmark status
router.post('/toggle-bookmark/:courseId', verifyAdminToken, async (req, res) => {
  try {
    let bookmark = await AdminBookmark.findOne({
      adminId: req.userId,
      courseId: req.params.courseId,
    });

    if (!bookmark) {
      bookmark = new AdminBookmark({
        adminId: req.userId,
        courseId: req.params.courseId,
        courseBookmarked: true,
        courseLiked: false,
      });
    } else {
      bookmark.courseBookmarked = !bookmark.courseBookmarked;
    }

    await bookmark.save();

    res.status(200).json({
      message: bookmark.courseBookmarked ? 'Course bookmarked' : 'Bookmark removed',
      bookmark,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle like status
router.post('/toggle-like/:courseId', verifyAdminToken, async (req, res) => {
  try {
    let bookmark = await AdminBookmark.findOne({
      adminId: req.userId,
      courseId: req.params.courseId,
    });

    if (!bookmark) {
      bookmark = new AdminBookmark({
        adminId: req.userId,
        courseId: req.params.courseId,
        courseLiked: true,
        courseBookmarked: false,
      });
    } else {
      bookmark.courseLiked = !bookmark.courseLiked;
    }

    await bookmark.save();

    res.status(200).json({
      message: bookmark.courseLiked ? 'Course liked' : 'Like removed',
      bookmark,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove bookmark
router.delete('/:courseId', verifyAdminToken, async (req, res) => {
  try {
    const bookmark = await AdminBookmark.findOneAndDelete({
      adminId: req.userId,
      courseId: req.params.courseId,
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.status(200).json({
      message: 'Bookmark deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
