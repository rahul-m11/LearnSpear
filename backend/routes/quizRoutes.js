const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
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
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all quizzes for a course
router.get('/course/:courseId', verifyAdminToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.status(200).json({
      message: 'Quizzes retrieved successfully',
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single quiz
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.status(200).json({
      message: 'Quiz retrieved successfully',
      quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create quiz
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { courseId, title, description } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Course ID and title are required' });
    }

    const quiz = new Quiz({
      courseId,
      title,
      description: description || '',
      questions: [],
      rewards: {
        firstTry: 10,
        secondTry: 7,
        thirdTry: 5,
        fourthTry: 2,
      },
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quiz
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { title, description, questions, rewards, isPublished } = req.body;

    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (rewards) quiz.rewards = rewards;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    quiz.updatedAt = Date.now();
    await quiz.save();

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quiz
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.status(200).json({
      message: 'Quiz deleted successfully',
      quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
