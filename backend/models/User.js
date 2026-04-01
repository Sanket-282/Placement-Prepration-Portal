const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  userType: {
    type: String,
    required: [true, 'Please select user type'],
    enum: ['student', 'graduate', 'it-professional', 'non-it-professional']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'suspended'],
    default: 'active'
  },
  score: {
    type: Number,
    default: 0
  },
  testsCompleted: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  loginOTPVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    select: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  bookmarkedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  bookmarkedCodingQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  }],
  // Profile fields added (optional)
  firstName: String,
  middleName: String,
  lastName: String,
  profileImage: String,
  dob: Date,
  gender: String,
  maritalStatus: String,
  summary: String,
  rolesResponsibilities: String,
  skills: [String],
  interests: [String],
  coreValues: [String],
  languagesKnown: [String],
  weblinks: [String],
  awards: [String],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: String,
    credentialId: String,
    link: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: String,
    endYear: String,
    percentage: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: String,
    link: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  careerJourney: [{
    type: {
      type: String,
      enum: ['professional', 'education']
    },
    title: String,
    description: String,
    startDate: Date,
    endDate: Date
  }],
  contactInfo: {
    phone: String,
    currentAddress: String,
    country: String,
    state: String,
    city: String,
    postalCode: String,
    permanentAddress: String,
    sameAsCurrent: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

userSchema.methods.generateOTP = async function() {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });

  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000;
  await this.save();

  return otp;
};

userSchema.methods.verifyOTP = async function(enteredOTP) {
  const normalizedOtp = `${enteredOTP ?? ''}`.trim();

  if (!this.otp || !normalizedOtp || !this.otpExpiry || this.otpExpiry < Date.now()) {
    return false;
  }

  if (`${this.otp}` !== normalizedOtp) {
    return false;
  }

  this.otp = undefined;
  this.otpExpiry = undefined;
  this.isVerified = true;
  await this.save();

  return true;
};

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

