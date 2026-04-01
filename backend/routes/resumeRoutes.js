const express = require('express');
const {
  createOrUpdateResume,
  getResumeByUserId,
  updateResumeById
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createOrUpdateResume);
router.get('/:userId', getResumeByUserId);
router.put('/:id', updateResumeById);

module.exports = router;
