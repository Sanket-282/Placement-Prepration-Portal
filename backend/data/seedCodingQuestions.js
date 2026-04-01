const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CodingQuestion = require('../models/CodingQuestion');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing questions (optional)
    // await CodingQuestion.deleteMany({});

    // Check current count
    // Force seed all questions
    // const count = await CodingQuestion.countDocuments({isActive: true});
    // if (count > 0) {
    //   console.log(`Found ${count} active coding questions. Skipping seed.`);
    //   process.exit(0);
    // }

    console.log('Seeding coding questions...');

    const questions = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        problemStatement: 'You may assume that each input would have exactly one solution, and you may not use the same element twice. You must return the indices in ascending order.',
        inputFormat: 'First line: n (size)\nSecond line: n integers\nThird line: target',
        outputFormat: 'Two space-separated indices',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\ntarget range similar',
        examples: [
          {
            input: '4\n2 7 11 15\n9',
            output: '0 1',
            explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
          },
          {
            input: '3\n3 2 4\n6',
            output: '1 2',
            explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
          }
        ],
        testCases: [
          {
            input: '4\n2 7 11 15\n9',
            output: '0 1'
          },
          {
            input: '3\n3 2 4\n6',
            output: '1 2'
          },
          {
            input: '2\n3 3\n6',
            output: '0 1'
          }
        ],
        difficulty: 'easy',
        category: 'arrays',
        tags: ['hashmap', 'array'],
        language: ['javascript', 'python', 'java', 'cpp'],
        starterCode: {
          javascript: `function twoSum(nums, target) {
  // Your code here
}`,
          python: `def twoSum(nums, target):
    # Your code here`,
          java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
}`,
          cpp: `vector<int> twoSum(vector<int>& nums, int target) {
  // Your code here
}`
        },
        timeLimit: 2,
        memoryLimit: 256,
        points: 10,
        isActive: true
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        problemStatement: 'An input string is valid if open brackets must be closed by the same type in correct order.',
        constraints: '1 <= s.length <= 10^4',
        examples: [
          {
            input: '"()"',
            output: 'true',
            explanation: 'Valid'
          },
          {
            input: '"()[]{}"',
            output: 'true',
            explanation: 'Valid'
          },
          {
            input: '"(]"',
            output: 'false',
            explanation: 'Invalid'
          }
        ],
        testCases: [
          { input: '()', output: 'true' },
          { input: '()[]{}', output: 'true' },
          { input: '(]', output: 'false' },
          { input: '{[}]', output: 'false' }
        ],
        difficulty: 'easy',
        category: 'strings',
        tags: ['stack', 'string'],
        language: ['javascript', 'python', 'java', 'cpp'],
        starterCode: {
          javascript: `var isValid = function(s) {
  // Your code here
};`,
          python: `def isValid(s):
    # Your code here`
        },
        points: 15,
        isActive: true
      },
      {
        title: 'Container With Most Water',
        description: 'Given n non-negative integers a1, a2, ..., an , where each represent height, find two lines to form container holding most water.',
        problemStatement: 'Notice boundaries cannot be moved. Answer area of container.',
        constraints: 'n = height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
        examples: [
          {
            input: '[1,8,6,2,5,4,8,3,7]',
            output: '49',
            explanation: 'Index 1 (height=8) and index 8 (height=7), area = 7 * 7 = 49'
          }
        ],
        testCases: [
          { input: '[1,8,6,2,5,4,8,3,7]', output: '49' },
          { input: '[1,1]', output: '1' },
          { input: '[4,3,2,1,4]', output: '16' },
          { input: '[1,2,1]', output: '2' }
        ],
        difficulty: 'medium',
        category: 'arrays',
        tags: ['array', 'two-pointers'],
        language: ['javascript', 'python'],
        starterCode: {
          javascript: `var maxArea = function(height) {
  // Your code here
};`
        },
        points: 25,
        isActive: true
      }
    ];

    for (let question of questions) {
      const existing = await CodingQuestion.findOne({ title: question.title });
      if (!existing) {
        await CodingQuestion.create(question);
        console.log(`Created: ${question.title}`);
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedDB();

