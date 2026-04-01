const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const fs = require('fs');
const path = require('path');

const normalizeArrayField = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => typeof item === 'string' ? item.split(',') : [])
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('question', 'question category')
      .populate('codingQuestion', 'title');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || user.avatar,
        dob: user.dob,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        userType: user.userType,
        summary: user.summary,
        rolesResponsibilities: user.rolesResponsibilities,
        skills: normalizeArrayField(user.skills),
        interests: normalizeArrayField(user.interests),
        coreValues: normalizeArrayField(user.coreValues),
        languagesKnown: normalizeArrayField(user.languagesKnown),
        weblinks: normalizeArrayField(user.weblinks),
        careerJourney: user.careerJourney || [],
        awards: normalizeArrayField(user.awards),
        certifications: user.certifications || [],
        contactInfo: user.contactInfo || {},
        education: user.education || [],
        projects: user.projects || [],
        experience: user.experience || [],
        score: user.score,
        testsCompleted: user.testsCompleted,
        totalQuestionsSolved: user.totalQuestionsSolved,
        totalCodingSolved: user.totalCodingSolved,
        rank: user.rank,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      recentActivity: recentSubmissions
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = req.body;
    const user = await User.findById(req.user.id);
    const arrayFields = ['skills', 'interests', 'coreValues', 'languagesKnown', 'weblinks', 'awards'];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update all provided fields (safe merge) - FIXED: Always update provided fields
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (key === 'name' && (fieldsToUpdate.firstName || fieldsToUpdate.lastName)) {
        // Skip if splitting name
        continue;
      }
      if (arrayFields.includes(key)) {
        user[key] = normalizeArrayField(value);
        continue;
      }
      // Removed buggy check: always update provided fields
      user[key] = value;
    }

    // Handle name splitting
    if (fieldsToUpdate.firstName || fieldsToUpdate.middleName || fieldsToUpdate.lastName) {
      user.firstName = fieldsToUpdate.firstName || user.firstName;
      user.middleName = fieldsToUpdate.middleName || user.middleName;
      user.lastName = fieldsToUpdate.lastName || user.lastName;
      user.name = `${user.firstName} ${user.middleName || ''} ${user.lastName}`.replace(/\s+/g, ' ').trim();
    }

    await user.save();

    // Return FULL user profile for frontend refresh
    const fullUser = await User.findById(user._id).select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpiry');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: fullUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/user/profile/upload
// @access  Private
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'profiles');
      const filename = path.basename(req.file.filename);
      const fullPath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'profiles');
    const filename = path.basename(req.file.filename);

    // Helper to delete old image safely
    const deleteImage = (imagePath) => {
      if (imagePath) {
        const oldFilename = path.basename(imagePath);
        const oldFullPath = path.join(UPLOAD_DIR, oldFilename);
        if (fs.existsSync(oldFullPath)) {
          try {
            fs.unlinkSync(oldFullPath);
          } catch (err) {
            console.warn('Failed to delete old image:', err.message);
          }
        }
      }
    };

    // Delete old images
    deleteImage(user.profileImage);
    deleteImage(user.avatar);

    // Store relative path
    const relativePath = `profiles/${filename}`;
    user.profileImage = relativePath;
    user.avatar = relativePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'profiles');
    const filename = path.basename(req.file ? req.file.filename : '');
    const fullPath = path.join(UPLOAD_DIR, filename);
    if (req.file && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// @desc Get user stats
// @route GET /api/user/stats
// @access Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('totalQuestionsSolved totalCodingSolved testsCompleted');
    
    const stats = {
      aptitude: {
        correct: user.totalQuestionsSolved || 0,
        total: 100
      },
      coding: {
        accepted: user.totalCodingSolved || 0,
        total: 50
      },
      mockTests: {
        passed: user.testsCompleted || 0,
        total: 10
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export other functions for compatibility (stubs for routes)
module.exports.getProfile = exports.getProfile;
module.exports.updateProfile = exports.updateProfile;
module.exports.uploadProfileImage = exports.uploadProfileImage;
module.exports.getStats = exports.getStats;
module.exports.getBookmarks = async (req, res) => { res.json({ success: true, bookmarks: [] }); };
module.exports.addBookmark = async (req, res) => { res.json({ success: true }); };
module.exports.removeBookmark = async (req, res) => { res.json({ success: true }); };
module.exports.getSubmissions = async (req, res) => { res.json({ success: true, submissions: [] }); };

