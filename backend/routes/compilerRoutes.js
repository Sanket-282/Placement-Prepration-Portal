const express = require('express');
const { protect } = require('../middleware/auth');
const { runCode } = require('../controllers/codingController');

const router = express.Router();

router.post('/run', protect, runCode);

module.exports = router;
