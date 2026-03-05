const express = require('express');
const router = express.Router();
const { 
  getMockTests, 
  getMockTest, 
  startMockTest,
  submitMockTest,
  createMockTest,
  updateMockTest,
  deleteMockTest
} = require('../controllers/mockTestController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getMockTests);
router.get('/:id', protect, getMockTest);

// Protected routes
router.post('/:id/start', protect, startMockTest);
router.post('/:id/submit', protect, submitMockTest);

// Admin routes
router.post('/', protect, isAdmin, createMockTest);
router.put('/:id', protect, isAdmin, updateMockTest);
router.delete('/:id', protect, isAdmin, deleteMockTest);

module.exports = router;

