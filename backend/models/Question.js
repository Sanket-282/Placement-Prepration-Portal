const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['aptitude', 'programming', 'reasoning', 'verbal']
  },
  subcategory: {
    type: String,
    required: [true, 'Please specify subcategory'],
    enum: [
      'quantitative',
      'data-interpretation',
      'logical-reasoning',
      'verbal-reasoning',
      'non-verbal-reasoning',
      'verbal-ability',
      'technical-mcq',
      'dsa',
      'interview'
    ]
  },
  question: {
    type: String,
    required: [true, 'Please provide a question']
  },
  options: {
    type: [String],
    required: [true, 'Please provide options'],
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'Please provide exactly 4 options'
    }
  },
  answer: {
    type: Number,
    required: [true, 'Please specify correct answer index'],
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty'],
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  isCompanySpecific: {
    type: Boolean,
    default: false
  },
  company: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ category: 1, subcategory: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);

