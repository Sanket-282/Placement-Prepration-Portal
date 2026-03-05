const express = require('express');
const router = express.Router();
const { 
  getCompanies, 
  getCompanyQuestions, 
  addCompanyQuestions, 
  deleteCompany 
} = require('../controllers/companyController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getCompanies);
router.get('/:name', getCompanyQuestions);

// Admin routes
router.post('/', protect, isAdmin, addCompanyQuestions);
router.delete('/:name', protect, isAdmin, deleteCompany);

module.exports = router;

