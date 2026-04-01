const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadProfileImage,
  getBookmarks, 
  addBookmark, 
  removeBookmark,
  getSubmissions,
  getStats 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/upload', upload, uploadProfileImage);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', addBookmark);
router.delete('/bookmarks', removeBookmark);
router.get('/submissions', getSubmissions);
router.get('/stats', getStats);

module.exports = router;

