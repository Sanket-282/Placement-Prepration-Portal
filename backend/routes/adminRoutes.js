const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const MockTest = require('../models/MockTest');
const Submission = require('../models/Submission');
const { protect, isAdmin } = require('../middleware/auth');

// All routes require admin
router.use(protect, isAdmin);

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's submissions
    await Submission.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Get analytics
// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ isAdmin: true });

    // Question stats
    const totalQuestions = await Question.countDocuments();
    const totalCodingQuestions = await CodingQuestion.countDocuments();

    // Test stats
    const totalMockTests = await MockTest.countDocuments();

    // Submission stats
    const totalSubmissions = await Submission.countDocuments();
    const todaySubmissions = await Submission.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Score stats
    const topUsers = await User.find()
      .select('name email score testsCompleted')
      .sort({ score: -1 })
      .limit(10);

    // Category distribution
    const questionCategories = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Daily signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent activity
    const recentSubmissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('question', 'question')
      .populate('codingQuestion', 'title');

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          admins: adminUsers
        },
        questions: {
          aptitude: questionCategories.find(c => c._id === 'aptitude')?.count || 0,
          programming: questionCategories.find(c => c._id === 'programming')?.count || 0,
          total: totalQuestions,
          coding: totalCodingQuestions
        },
        tests: {
          total: totalMockTests
        },
        submissions: {
          total: totalSubmissions,
          today: todaySubmissions
        },
        topUsers,
        dailySignups,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @desc    Get all submissions (Admin)
// @route   GET /api/admin/submissions
router.get('/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type } = req.query;
    
    let query = {};
    if (userId) query.user = userId;
    if (type) query.type = type;

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('question', 'question category')
      .populate('codingQuestion', 'title')
      .populate('mockTest', 'title');

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});

module.exports = router;

