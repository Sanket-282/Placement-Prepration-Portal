const mongoose = require('mongoose');

const TEMPLATE_IDS = [
  'modern',
  'modern-grid',
  'modern-minimal',
  'classic',
  'classic-serif',
  'classic-blue',
  'executive',
  'executive-dark',
  'executive-column',
  'creative-bloom',
  'metro-line',
  'spotlight',
  'mono-pro',
  'gradient-card',
  'clean-accent',
  'professional'
];

const THEME_IDS = ['ocean', 'royal', 'sunset', 'forest'];

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    personalInfo: {
      fullName: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      location: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
      portfolio: { type: String, trim: true, default: '' }
    },
    targetRole: {
      type: String,
      trim: true,
      default: ''
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    education: [
      {
        degree: { type: String, trim: true, default: '' },
        college: { type: String, trim: true, default: '' },
        year: { type: String, trim: true, default: '' },
        cgpa: { type: String, trim: true, default: '' }
      }
    ],
    skills: {
      technical: [{ type: String, trim: true }],
      soft: [{ type: String, trim: true }]
    },
    projects: [
      {
        title: { type: String, trim: true, default: '' },
        description: { type: String, trim: true, default: '' },
        techStack: [{ type: String, trim: true }],
        githubLink: { type: String, trim: true, default: '' },
        liveLink: { type: String, trim: true, default: '' }
      }
    ],
    experience: [
      {
        company: { type: String, trim: true, default: '' },
        role: { type: String, trim: true, default: '' },
        duration: { type: String, trim: true, default: '' },
        description: { type: String, trim: true, default: '' }
      }
    ],
    certifications: [
      {
        name: { type: String, trim: true, default: '' },
        issuer: { type: String, trim: true, default: '' },
        year: { type: String, trim: true, default: '' },
        credentialId: { type: String, trim: true, default: '' },
        link: { type: String, trim: true, default: '' }
      }
    ],
    achievements: [{ type: String, trim: true }],
    extracurricular: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    template: {
      type: String,
      enum: TEMPLATE_IDS,
      default: 'modern'
    },
    theme: {
      type: String,
      enum: THEME_IDS,
      default: 'ocean'
    },
    atsScore: {
      type: Number,
      default: 0
    },
    completionScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
