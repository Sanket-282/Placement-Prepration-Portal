const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const fs = require('fs').promises;
const path = require('path');

// Get profile (extended)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpiry');
    const recentSubmissions = await Submission.find({ user: user._id }).sort({ createdAt: -1 }).limit(10).populate('question', 'question category').populate('codingQuestion', 'title');
    res.status(200).json({
      success: true,
      user,
      recentActivity: recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile (merge all fields)
exports.updateProfile = async (req, res) => {
  try {
    const fields = req.body;
    const user = await User.findById(req.user.id);

    // Safe update all fields
    Object.keys(fields).forEach(key => {
      if (key !== 'name' || (!fields.firstName && !fields.lastName)) user[key] = fields[key];
    });

    // Name splitting
    if (fields.firstName || fields.lastName) {
      user.firstName = fields.firstName || user.firstName;
      user.lastName = fields.lastName || user.lastName;
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    
    // Delete old
    if (user.profileImage) {
      try {
        await fs.unlink(user.profileImage);
      } catch {}
    }

    user.profileImage = req.file.path;
    await user.save();

    res.json({ success: true, profileImage: req.file.path });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, message: error.message });
  }
};

// Existing functions (unchanged)
exports.getBookmarks = async (req, res) => {/* existing code */};
exports.addBookmark = async (req, res) => {/* existing */};
exports.removeBookmark = async (req, res) => {/* existing */};
exports.getSubmissions = async (req, res) => {/* existing */};
exports.getStats = async (req, res) => {/* existing */};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getBookmarks, 
  addBookmark,
  removeBookmark,
  getSubmissions,
  getStats
};

