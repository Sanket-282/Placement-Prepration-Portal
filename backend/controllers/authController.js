const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/emailSender');

// @desc    Register new user (Step 1 - initial registration)
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      userType,
      isVerified: false
    });

    // Generate OTP
    const otp = await user.generateOTP();

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Verify your Placement Portal Account',
      message: emailTemplates.otpVerification(name, otp),
      otp: otp
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user._id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    const isValid = await user.verifyOTP(otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Placement Preparation Portal!',
      message: emailTemplates.welcomeEmail(user.name)
    });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isAdmin: user.isAdmin,
        score: user.score,
        testsCompleted: user.testsCompleted
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    // Generate new OTP
    const otp = await user.generateOTP();

    // Send OTP email
    await sendEmail({
      to: user.email,
      subject: 'Your New OTP - Placement Portal',
      message: emailTemplates.otpVerification(user.name, otp)
    });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password'
      });
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: email || phone }, { phone: phone || email }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your account first',
        userId: user._id,
        requiresVerification: true
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Direct login - no OTP required
    const token = user.getSignedJwtToken();

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isAdmin: user.isAdmin,
        score: user.score,
        testsCompleted: user.testsCompleted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Verify login OTP
// @route   POST /api/auth/login-verify
// @access  Public
exports.loginVerify = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValid = await user.verifyOTP(otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark as loginOTPVerified so future logins don't need OTP
    user.loginOTPVerified = true;
    
    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isAdmin: user.isAdmin,
        score: user.score,
        testsCompleted: user.testsCompleted
      }
    });
  } catch (error) {
    console.error('Login verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isAdmin: user.isAdmin,
        score: user.score,
        testsCompleted: user.testsCompleted,
        totalQuestionsSolved: user.totalQuestionsSolved,
        totalCodingSolved: user.totalCodingSolved,
        rank: user.rank,
        education: user.education,
        skills: user.skills,
        projects: user.projects,
        experience: user.experience
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

