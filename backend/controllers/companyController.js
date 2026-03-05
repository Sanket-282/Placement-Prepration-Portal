const CompanyQuestion = require('../models/CompanyQuestion');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    const companies = await CompanyQuestion.find({}).sort({ company: 1 });

    const companyList = [
      { name: 'TCS', logo: '/companies/tcs.png', description: 'Tata Consultancy Services' },
      { name: 'Infosys', logo: '/companies/infosys.png', description: 'Infosys Limited' },
      { name: 'Wipro', logo: '/companies/wipro.png', description: 'Wipro Limited' },
      { name: 'Accenture', logo: '/companies/accenture.png', description: 'Accenture plc' },
      { name: 'Capgemini', logo: '/companies/capgemini.png', description: 'Capgemini SE' },
      { name: 'Amazon', logo: '/companies/amazon.png', description: 'Amazon.com Inc.' },
      { name: 'Google', logo: '/companies/google.png', description: 'Alphabet Inc.' },
      { name: 'Microsoft', logo: '/companies/microsoft.png', description: 'Microsoft Corporation' },
      { name: 'Meta', logo: '/companies/meta.png', description: 'Meta Platforms Inc.' },
      { name: 'Apple', logo: '/companies/apple.png', description: 'Apple Inc.' },
      { name: 'IBM', logo: '/companies/ibm.png', description: 'IBM Corporation' },
      { name: 'Adobe', logo: '/companies/adobe.png', description: 'Adobe Inc.' },
      { name: 'Oracle', logo: '/companies/oracle.png', description: 'Oracle Corporation' },
      { name: 'Cognizant', logo: '/companies/cognizant.png', description: 'Cognizant' },
      { name: 'Tech Mahindra', logo: '/companies/techmahindra.png', description: 'Tech Mahindra' }
    ];

    // Merge with database data
    const companiesWithCounts = companyList.map(company => {
      const dbCompany = companies.find(c => c.company === company.name);
      return {
        ...company,
        totalQuestions: dbCompany ? dbCompany.totalQuestions : 0,
        totalCoding: dbCompany ? dbCompany.totalCoding : 0,
        totalInterview: dbCompany ? dbCompany.totalInterview : 0
      };
    });

    res.status(200).json({
      success: true,
      count: companiesWithCounts.length,
      companies: companiesWithCounts
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// @desc    Get single company questions
// @route   GET /api/companies/:name
// @access  Public
exports.getCompanyQuestions = async (req, res) => {
  try {
    const { name } = req.params;
    const { type } = req.query;

    const company = await CompanyQuestion.findOne({ company: name });

    if (!company) {
      // Return sample data if not in database
      return res.status(200).json({
        success: true,
        company: {
          name,
          description: `${name} interview questions and placement preparation`,
          questions: [],
          interviewQuestions: getSampleInterviewQuestions(name),
          codingProblems: getSampleCodingProblems(name)
        }
      });
    }

    let questions = company.questions;

    if (type && type !== 'all') {
      questions = questions.filter(q => q.type === type);
    }

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        name: company.company,
        logo: company.logo,
        description: company.description,
        questions,
        interviewQuestions: company.interviewQuestions,
        codingProblems: company.codingProblems,
        placementProcess: company.placementProcess,
        totalQuestions: questions.length,
        totalCoding: company.codingProblems.length,
        totalInterview: company.interviewQuestions.length
      }
    });
  } catch (error) {
    console.error('Get company questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company questions',
      error: error.message
    });
  }
};

// @desc    Add or update company questions (Admin)
// @route   POST /api/companies
// @access  Private (Admin)
exports.addCompanyQuestions = async (req, res) => {
  try {
    const { company, questions, interviewQuestions, codingProblems, placementProcess, logo, description } = req.body;

    // Check if company exists
    let companyDoc = await CompanyQuestion.findOne({ company });

    if (companyDoc) {
      // Update existing
      companyDoc.questions = questions || companyDoc.questions;
      companyDoc.interviewQuestions = interviewQuestions || companyDoc.interviewQuestions;
      companyDoc.codingProblems = codingProblems || companyDoc.codingProblems;
      companyDoc.placementProcess = placementProcess || companyDoc.placementProcess;
      if (logo) companyDoc.logo = logo;
      if (description) companyDoc.description = description;
      
      await companyDoc.save();
    } else {
      // Create new
      companyDoc = await CompanyQuestion.create({
        company,
        questions: questions || [],
        interviewQuestions: interviewQuestions || [],
        codingProblems: codingProblems || [],
        placementProcess: placementProcess || [],
        logo: logo || '',
        description: description || ''
      });
    }

    // Update counts
    await CompanyQuestion.updateCounts(company);

    res.status(201).json({
      success: true,
      message: 'Company questions updated successfully',
      company: companyDoc
    });
  } catch (error) {
    console.error('Add company questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding company questions',
      error: error.message
    });
  }
};

// @desc    Delete company (Admin)
// @route   DELETE /api/companies/:name
// @access  Private (Admin)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await CompanyQuestion.findOneAndDelete({ company: req.params.name });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};

// Helper functions for sample data
function getSampleInterviewQuestions(company) {
  const sampleQuestions = {
    'TCS': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'HR', frequency: 95 },
      { question: 'Why do you want to join TCS?', difficulty: 'easy', category: 'HR', frequency: 90 },
      { question: 'What are your strengths and weaknesses?', difficulty: 'easy', category: 'HR', frequency: 85 },
      { question: 'Explain your project in detail', difficulty: 'medium', category: 'Technical', frequency: 95 },
      { question: 'What is OOP?', difficulty: 'easy', category: 'Technical', frequency: 80 }
    ],
    'Infosys': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'HR', frequency: 90 },
      { question: 'Why Infosys?', difficulty: 'easy', category: 'HR', frequency: 85 },
      { question: 'Explain polymorphism with example', difficulty: 'medium', category: 'Technical', frequency: 75 },
      { question: 'What is the difference between SQL and NoSQL?', difficulty: 'medium', category: 'Technical', frequency: 70 },
      { question: 'Explain your final year project', difficulty: 'medium', category: 'Technical', frequency: 90 }
    ],
    'Amazon': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'Leadership', frequency: 95 },
      { question: 'Why Amazon?', difficulty: 'easy', category: 'Leadership', frequency: 90 },
      { question: 'Describe a challenging situation and how you handled it', difficulty: 'hard', category: 'Leadership', frequency: 95 },
      { question: 'Explain the concept of AWS', difficulty: 'medium', category: 'Technical', frequency: 80 },
      { question: 'What is the time complexity of quicksort?', difficulty: 'medium', category: 'Technical', frequency: 75 }
    ],
    'Google': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'General', frequency: 90 },
      { question: 'Why Google?', difficulty: 'easy', category: 'General', frequency: 85 },
      { question: 'Explain bubble sort and its complexity', difficulty: 'medium', category: 'Technical', frequency: 70 },
      { question: 'What happens when you type google.com in browser?', difficulty: 'hard', category: 'Technical', frequency: 85 },
      { question: 'Design a URL shortener', difficulty: 'hard', category: 'System Design', frequency: 80 }
    ]
  };

  return sampleQuestions[company] || [
    { question: 'Tell me about yourself', difficulty: 'easy', category: 'General', frequency: 80 },
    { question: 'Why do you want to join us?', difficulty: 'easy', category: 'HR', frequency: 75 },
    { question: 'Tell me about your projects', difficulty: 'medium', category: 'Technical', frequency: 85 }
  ];
}

function getSampleCodingProblems(company) {
  const sampleProblems = {
    'TCS': [
      { title: 'Reverse a String', difficulty: 'easy', topics: ['Strings'] },
      { title: 'Check Palindrome', difficulty: 'easy', topics: ['Strings'] },
      { title: 'Find Maximum in Array', difficulty: 'easy', topics: ['Arrays'] }
    ],
    'Infosys': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays', 'Hashing'] },
      { title: 'Valid Parentheses', difficulty: 'medium', topics: ['Stacks'] },
      { title: 'Merge Sorted Arrays', difficulty: 'medium', topics: ['Arrays'] }
    ],
    'Amazon': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays', 'Hashing'] },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', topics: ['Sliding Window'] },
      { title: 'LRU Cache', difficulty: 'hard', topics: ['Design'] },
      { title: 'Number of Islands', difficulty: 'medium', topics: ['Graphs', 'DFS'] }
    ],
    'Google': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays'] },
      { title: 'Reverse Linked List', difficulty: 'easy', topics: ['Linked Lists'] },
      { title: 'Merge Intervals', difficulty: 'medium', topics: ['Arrays', 'Sorting'] },
      { title: 'Median of Two Sorted Arrays', difficulty: 'hard', topics: ['Binary Search'] }
    ]
  };

  return sampleProblems[company] || [
    { title: 'Basic Programming Question', difficulty: 'easy', topics: ['Basics'] }
  ];
}

