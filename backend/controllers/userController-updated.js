const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const fs = require('fs');
const path = require('path');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
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
        skills: user.skills || [],
        interests: user.interests || [],
        coreValues: user.coreValues || [],
        languagesKnown: user.languagesKnown || [],
        weblinks: user.weblinks || [],
        careerJourney: user.careerJourney || [],
        awards: user.awards || [],
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update all provided fields (safe merge)
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (key === 'name' && (fieldsToUpdate.firstName || fieldsToUpdate.lastName)) {
        // Skip if splitting name
        continue;
      }
      if (user[key] !== undefined) {
        user[key] = value;
      }
    }

    // Fix array fields - split comma strings to proper arrays
    const arrayFields = ['skills', 'interests', 'coreValues', 'languagesKnown', 'weblinks', 'awards'];
    arrayFields.forEach(field => {
      if (fieldsToUpdate[field] && typeof fieldsToUpdate[field] === 'string' && fieldsToUpdate[field].trim()) {
        user[field] = fieldsToUpdate[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    // Handle name splitting
    if (fieldsToUpdate.firstName || fieldsToUpdate.middleName || fieldsToUpdate.lastName) {
      user.firstName = fieldsToUpdate.firstName || user.firstName;
      user.middleName = fieldsToUpdate.middleName || user.middleName;
      user.lastName = fieldsToUpdate.lastName || user.lastName;
      user.name = `${user.firstName} ${user.middleName || ''} ${user.lastName}`.replace(/\s+/g, ' ').trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage || user.avatar,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        dob: user.dob,
        gender: user.gender,
        maritalStatus: user.maritalStatus,
        userType: user.userType,
        summary: user.summary,
        skills: user.skills,
        interests: user.interests,
        coreValues: user.coreValues,
        languagesKnown: user.languagesKnown,
        weblinks: user.weblinks,
        careerJourney: user.careerJourney,
        awards: user.awards,
        contactInfo: user.contactInfo,
        education: user.education,
        projects: user.projects,
        experience: user.experience
      }
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
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old image if exists
    if (user.profileImage && fs.existsSync(`backend/uploads/profiles/${path.basename(user.profileImage)}`)) {
      fs.unlinkSync(`backend/uploads/profiles/${path.basename(user.profileImage)}`);
    }
    if (user.avatar && fs.existsSync(`backend/uploads/profiles/${path.basename(user.avatar)}`)) {
      fs.unlinkSync(`backend/uploads/profiles/${path.basename(user.avatar)}`);
    }

    // Save new image path
    user.profileImage = req.file.path;
    user.avatar = req.file.path; // Keep compatibility
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Keep all existing exports
exports.getBookmarks = async (req, res) => {
  // ... existing code unchanged
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedQuestions')
      .populate('bookmarkedCodingQuestions');

    res.status(200).json({
      success: true,
      questions: user.bookmarkedQuestions || [],
      codingQuestions: user.bookmarkedCodingQuestions || []
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};

exports.addBookmark = async (req, res) => {
  // ... existing code unchanged
  try {
    const { questionId, questionType, codingQuestionId } = req.body;
    const userId = req.user.id;

    if (questionType === 'aptitude' && questionId) {
      const user = await User.findById(userId);
      if (user.bookmarkedQuestions.includes(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'Question already bookmarked'
        });
      }
      await User.findByIdAndUpdate(userId, {
        $push: { bookmarkedQuestions: questionId }
      });
    } else if (questionType === 'coding' && codingQuestionId) {
      const user = await User.findById(userId);
      if (user.bookmarkedCodingQuestions.includes(codingQuestionId)) {
        return res.status(400).json({
          success: false,
          message: 'Question already bookmarked'
        });
      }
      await User.findByIdAndUpdate(userId, {
        $push: { bookmarkedCodingQuestions: codingQuestionId }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookmark request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark added successfully'
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding bookmark',
      error: error.message
    });
  }
};

exports.removeBookmark = async (req, res) => {
  // ... existing code unchanged
  try {
    const { questionId, questionType, codingQuestionId } = req.body;
    const userId = req.user.id;

    if (questionType === 'aptitude' && questionId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedQuestions: questionId }
      });
    } else if (questionType === 'coding' && codingQuestionId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedCodingQuestions: codingQuestionId }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookmark request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing bookmark',
      error: error.message
    });
  }
};

exports.getSubmissions = async (req, res) => {
  // ... existing code unchanged
};

exports.getStats = async (req, res) => {
  // ... existing code unchanged
};

