const express = require('express');
const router = express.Router();
const { 
  signup, 
  verifyOTP, 
  resendOTP, 
  login, 
  loginVerify, 
  getMe, 
  updatePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/login-verify', loginVerify);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;

