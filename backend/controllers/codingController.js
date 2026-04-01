const CodingQuestion = require('../models/CodingQuestion');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Judge0 API configuration
const JUDGE0_API_URL = 'https://ce.judge0.com';

const languageIds = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54
};

const judge0Request = async (endpoint, method, body = null) => {
  const options = {
    method,
      headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${JUDGE0_API_URL}${endpoint}`, options);
  return response.json();
};

// @desc    Get all coding questions
// @route   GET /api/coding-questions
// @access  Public
exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty, category, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const questions = await CodingQuestion.find(query)
      .select('-solution -testCases')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CodingQuestion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      questions
    });
  } catch (error) {
    console.error('Get coding questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding questions',
      error: error.message
    });
  }
};

// @desc    Get single coding question
// @route   GET /api/coding-questions/:id
// @access  Public
exports.getCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    // Don't send solution and test cases
    const questionData = question.toObject();
    delete questionData.solution;
    delete questionData.testCases;

    res.status(200).json({
      success: true,
      question: questionData
    });
  } catch (error) {
    console.error('Get coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding question',
      error: error.message
    });
  }
};

// @desc    Get today's Daily Challenge (prefer isDailyActive)
  // @route   GET /api/coding-questions/daily
  // @access  Public
  exports.getDailyChallenge = async (req, res) => {
    try {
      // First try to get active daily challenge
      let question = await CodingQuestion.findOne({ isDailyActive: true, isActive: true });

      // Fallback to random if no daily active
      if (!question) {
        const difficultyWeights = { easy: 0.5, medium: 0.35, hard: 0.15 };
        const random = Math.random();
        let difficulty;
        
        if (random < difficultyWeights.easy) difficulty = 'easy';
        else if (random < difficultyWeights.easy + difficultyWeights.medium) difficulty = 'medium';
        else difficulty = 'hard';

        const dailyQ = await CodingQuestion.aggregate([
          { $match: { isActive: true, difficulty } },
          { $sample: { size: 1 } }
        ]);

        if (dailyQ.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No daily challenge available'
          });
        }

        question = dailyQ[0];
      }

      const questionData = {
        _id: question._id,
        title: question.title,
        description: question.description,
        problemStatement: question.problemStatement,
        inputFormat: question.inputFormat,
        outputFormat: question.outputFormat,
        constraints: question.constraints,
        examples: question.examples,
        difficulty: question.difficulty,
        category: question.category,
        language: question.language,
        starterCode: question.starterCode,
        points: question.points,
        isDailyChallenge: true,
        isDailyActive: question.isDailyActive
      };

      let alreadySolved = false;
      let previousSubmission = null;

      // Check if user already solved today's challenge
      if (req.user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingSubmission = await Submission.findOne({
          user: req.user.id,
          codingQuestion: question._id,
          isDailyChallenge: true,
          challengeDate: { $gte: today }
        });
        alreadySolved = !!existingSubmission;
        previousSubmission = existingSubmission;
      }

      res.status(200).json({
        success: true,
        question: questionData,
        alreadySolved,
        previousSubmission
      });
    } catch (error) {
      console.error('Get daily challenge error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching daily challenge',
        error: error.message
      });
    }
  };

// @desc    Run code (without submission)
// @route   POST /api/coding-questions/run
// @access  Private
exports.runCode = async (req, res) => {
  try {
    // Accept both 'input' and 'stdin' from frontend
    const { language, sourceCode, input, stdin, questionId } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language and source code'
      });
    }

    const languageId = languageIds[language];
    
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Use whichever input is provided (stdin or input)
    const codeInput = input || stdin || '';

    const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: codeInput ? Buffer.from(codeInput).toString('base64') : '',
      cpu_time_limit: 2,
      memory_limit: 128000
    });

    let stdout = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString('utf8') : '';
    let stderr = createResponse.stderr ? Buffer.from(createResponse.stderr, 'base64').toString('utf8') : '';
    let compile_output = createResponse.compile_output ? Buffer.from(createResponse.compile_output, 'base64').toString('utf8') : '';

    console.log('Judge0 createResponse:', createResponse);
    let finalOutput = compile_output || stderr || stdout || 'No output';
    console.log('decoded stdout:', stdout);
    console.log('finalOutput:', finalOutput);

    res.status(200).json({
      success: true,
      output: finalOutput,
      stdout: stdout,
      stderr: stderr,
      compile_output: compile_output,
      status: createResponse.status?.description,
      statusDescription: createResponse.status?.description,
      time: createResponse.time,
      memory: createResponse.memory,
      rawResponse: createResponse
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running code',
      error: error.message
    });
  }
};

// @desc    Submit code (with test cases)
// @route   POST /api/coding-questions/submit
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { language, sourceCode } = req.body;
    let questionId = req.body.questionId || req.body.codingQuestionId;
    const userId = req.user.id;

    if (!language || !sourceCode || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language, source code, and question ID'
      });
    }

    const question = await CodingQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    const languageId = languageIds[language];
    
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    const testCases = question.testCases;
    let passedTests = 0;
    const results = [];

    // Run each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
        source_code: Buffer.from(sourceCode).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(testCase.input).toString('base64'),
        cpu_time_limit: 2,
        memory_limit: 128000
      });

      const output = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString().trim() : '';
      const expectedOutput = testCase.output.trim();
      const isPassed = output === expectedOutput && createResponse.status?.id === 3;

      if (isPassed) passedTests++;

        results.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        output: output,
        status: 'Executed',
        isPassed,
        time: createResponse.time,
        memory: createResponse.memory
      });
    }

    const isAllPassed = passedTests === testCases.length;
    const score = isAllPassed ? question.points : Math.floor(question.points * (passedTests / testCases.length));

    // Create submission record
    const submission = await Submission.create({
      user: userId,
      codingQuestion: questionId,
      type: 'programming',
      code: {
        language,
        sourceCode
      },
      isCorrect: isAllPassed,
      score,
      maxScore: question.points,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      status: isAllPassed ? 'accepted' : 'wrong_answer'
    });

    // Update user score
    if (isAllPassed) {
      await User.findByIdAndUpdate(userId, {
        $inc: { score: score, totalCodingSolved: 1 }
      });

      // Update question stats
      await CodingQuestion.findByIdAndUpdate(questionId, {
        $inc: { totalSubmissions: 1 }
      });
    }

    const normalizedResult = {
      status: isAllPassed ? 'accepted' : 'wrong_answer',
      passedTests,
      totalTests: testCases.length,
      score
    };

    res.status(200).json({
      success: true,
      isCorrect: isAllPassed,
      score,
      maxScore: question.points,
      passedTests,
      totalTests: testCases.length,
      output: isAllPassed ? 'All test cases passed successfully.' : `${passedTests}/${testCases.length} test cases passed.`,
      result: normalizedResult,
      results,
      submission: {
        id: submission._id,
        isCorrect: submission.isCorrect,
        score: submission.score,
        submittedAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting code',
      error: error.message
    });
  }
};

// @desc    Add new coding question (Admin)
// @route   POST /api/coding-questions
// @access  Private (Admin)
exports.addCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coding question created successfully',
      question
    });
  } catch (error) {
    console.error('Add coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coding question',
      error: error.message
    });
  }
};

// @desc    Update coding question (Admin)
// @route   PUT /api/coding-questions/:id
// @access  Private (Admin)
exports.updateCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coding question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coding question',
      error: error.message
    });
  }
};

// @desc    Delete coding question (Admin)
  // @route   DELETE /api/coding-questions/:id
  // @access  Private (Admin)
  exports.deleteCodingQuestion = async (req, res) => {
    try {
      const question = await CodingQuestion.findByIdAndDelete(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Coding question not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Coding question deleted successfully'
      });
    } catch (error) {
      console.error('Delete coding question error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting coding question',
        error: error.message
      });
    }
  };

  // @desc    Toggle daily active status (Admin)
  // @route   PATCH /api/coding-questions/:id/set-daily
  // @access  Private (Admin)
  exports.toggleDailyActive = async (req, res) => {
    try {
      const questionId = req.params.id;

      // Deactivate all other daily challenges
      await CodingQuestion.updateMany({ isDailyActive: true }, { isDailyActive: false });

      // Toggle this one
      const question = await CodingQuestion.findById(questionId);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Coding question not found'
        });
      }

      question.isDailyActive = !question.isDailyActive;
      await question.save();

      res.status(200).json({
        success: true,
        message: `Coding question ${question.isDailyActive ? 'set as daily active' : 'deactivated as daily'}`,
        question
      });
    } catch (error) {
      console.error('Toggle daily active error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling daily active',
        error: error.message
      });
    }
  };

