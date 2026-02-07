const express = require('express');
const router = express.Router();
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
      return res.status(403).json({ error: 'Admin access only' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users (admin view)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
router.get('/role/:role', verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.status(200).json({
      message: `${req.params.role} users retrieved successfully`,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: user.toObject({ getters: true, virtuals: true }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/stats/summary', verifyAdminToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const instructors = await User.countDocuments({ role: 'instructor' });
    const learners = await User.countDocuments({ role: 'learner' });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      message: 'User statistics retrieved successfully',
      stats: {
        totalUsers,
        admins,
        instructors,
        learners,
        activeUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
