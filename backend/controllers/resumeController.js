const mongoose = require('mongoose');
const Resume = require('../models/Resume');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/|www\.)/i;

const ROLE_KEYWORDS = {
  'software engineer': ['javascript', 'react', 'node', 'mongodb', 'api'],
  'full stack developer': ['frontend', 'backend', 'react', 'express', 'mongodb'],
  'frontend developer': ['react', 'tailwind', 'responsive', 'javascript', 'ui'],
  'backend developer': ['node', 'express', 'mongodb', 'rest api', 'authentication'],
  'data analyst': ['sql', 'excel', 'python', 'power bi', 'analysis'],
  'ui ux designer': ['figma', 'wireframes', 'prototype', 'design system', 'usability'],
  'qa engineer': ['testing', 'bug tracking', 'automation', 'selenium', 'quality'],
  'devops engineer': ['docker', 'aws', 'ci/cd', 'linux', 'monitoring']
};

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const cleanString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map(cleanString).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/,|\n/)
      .map(cleanString)
      .filter(Boolean);
  }

  return [];
};

const normalizePersonalInfo = (value = {}, fallback = {}) => ({
  fullName: hasOwn(value, 'fullName') ? cleanString(value.fullName) : cleanString(fallback.fullName),
  email: hasOwn(value, 'email') ? cleanString(value.email).toLowerCase() : cleanString(fallback.email).toLowerCase(),
  phone: hasOwn(value, 'phone') ? cleanString(value.phone) : cleanString(fallback.phone),
  location: hasOwn(value, 'location') ? cleanString(value.location) : cleanString(fallback.location),
  linkedin: hasOwn(value, 'linkedin') ? cleanString(value.linkedin) : cleanString(fallback.linkedin),
  github: hasOwn(value, 'github') ? cleanString(value.github) : cleanString(fallback.github),
  portfolio: hasOwn(value, 'portfolio') ? cleanString(value.portfolio) : cleanString(fallback.portfolio)
});

const normalizeEducation = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          degree: cleanString(item?.degree),
          college: cleanString(item?.college),
          year: cleanString(item?.year),
          cgpa: cleanString(item?.cgpa)
        }))
        .filter((item) => Object.values(item).some(Boolean))
    : [];

const normalizeProjects = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          title: cleanString(item?.title),
          description: cleanString(item?.description),
          techStack: normalizeStringList(item?.techStack),
          githubLink: cleanString(item?.githubLink),
          liveLink: cleanString(item?.liveLink)
        }))
        .filter((item) => item.title || item.description || item.techStack.length > 0)
    : [];

const normalizeExperience = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          company: cleanString(item?.company),
          role: cleanString(item?.role),
          duration: cleanString(item?.duration),
          description: cleanString(item?.description)
        }))
        .filter((item) => Object.values(item).some(Boolean))
    : [];

const normalizeCertifications = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          name: cleanString(item?.name),
          issuer: cleanString(item?.issuer),
          year: cleanString(item?.year),
          credentialId: cleanString(item?.credentialId),
          link: cleanString(item?.link)
        }))
        .filter((item) => Object.values(item).some(Boolean))
    : [];

const normalizeSkills = (value = {}, fallback = {}) => ({
  technical: hasOwn(value, 'technical') ? normalizeStringList(value.technical) : normalizeStringList(fallback.technical),
  soft: hasOwn(value, 'soft') ? normalizeStringList(value.soft) : normalizeStringList(fallback.soft)
});

const normalizeResumePayload = (payload = {}, existingResume = null, user = null) => {
  const fallback = existingResume ? existingResume.toObject() : {};
  const personalInfoFallback = fallback.personalInfo || {
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  };

  return {
    userId: existingResume?.userId || user?._id,
    personalInfo: hasOwn(payload, 'personalInfo')
      ? normalizePersonalInfo(payload.personalInfo, personalInfoFallback)
      : normalizePersonalInfo(personalInfoFallback),
    targetRole: hasOwn(payload, 'targetRole') ? cleanString(payload.targetRole) : cleanString(fallback.targetRole),
    summary: hasOwn(payload, 'summary') ? cleanString(payload.summary) : cleanString(fallback.summary),
    education: hasOwn(payload, 'education') ? normalizeEducation(payload.education) : normalizeEducation(fallback.education),
    skills: hasOwn(payload, 'skills') ? normalizeSkills(payload.skills, fallback.skills) : normalizeSkills(fallback.skills),
    projects: hasOwn(payload, 'projects') ? normalizeProjects(payload.projects) : normalizeProjects(fallback.projects),
    experience: hasOwn(payload, 'experience') ? normalizeExperience(payload.experience) : normalizeExperience(fallback.experience),
    certifications: hasOwn(payload, 'certifications')
      ? normalizeCertifications(payload.certifications)
      : normalizeCertifications(fallback.certifications),
    achievements: hasOwn(payload, 'achievements') ? normalizeStringList(payload.achievements) : normalizeStringList(fallback.achievements),
    extracurricular: hasOwn(payload, 'extracurricular')
      ? normalizeStringList(payload.extracurricular)
      : normalizeStringList(fallback.extracurricular),
    languages: hasOwn(payload, 'languages') ? normalizeStringList(payload.languages) : normalizeStringList(fallback.languages),
    template: hasOwn(payload, 'template') ? cleanString(payload.template) || 'modern' : cleanString(fallback.template) || 'modern',
    theme: hasOwn(payload, 'theme') ? cleanString(payload.theme) || 'ocean' : cleanString(fallback.theme) || 'ocean'
  };
};

const validateUrls = (personalInfo, certifications, projects) => {
  const errors = [];
  const urlFields = [
    ['LinkedIn', personalInfo.linkedin],
    ['GitHub', personalInfo.github],
    ['Portfolio', personalInfo.portfolio]
  ];

  certifications.forEach((item, index) => {
    urlFields.push([`Certification ${index + 1} link`, item.link]);
  });

  projects.forEach((item, index) => {
    urlFields.push([`Project ${index + 1} GitHub`, item.githubLink]);
    urlFields.push([`Project ${index + 1} live link`, item.liveLink]);
  });

  urlFields.forEach(([label, value]) => {
    if (value && !URL_REGEX.test(value)) {
      errors.push(`${label} must start with http://, https://, or www.`);
    }
  });

  return errors;
};

const validateResumeDraft = (resume) => {
  const errors = [];

  if (resume.personalInfo.email && !EMAIL_REGEX.test(resume.personalInfo.email)) {
    errors.push('Please provide a valid email address.');
  }

  if (resume.personalInfo.phone && resume.personalInfo.phone.length < 10) {
    errors.push('Phone number should be at least 10 digits.');
  }

  return errors.concat(validateUrls(resume.personalInfo, resume.certifications, resume.projects));
};

const getRoleKeywords = (targetRole) => {
  const loweredRole = cleanString(targetRole).toLowerCase();
  const exactMatch = ROLE_KEYWORDS[loweredRole];

  if (exactMatch) {
    return exactMatch;
  }

  return Object.entries(ROLE_KEYWORDS).find(([role]) => loweredRole.includes(role))?.[1] || [];
};

const buildResumeText = (resume) =>
  [
    resume.targetRole,
    resume.summary,
    resume.skills.technical.join(' '),
    resume.skills.soft.join(' '),
    ...resume.projects.flatMap((item) => [item.title, item.description, item.techStack.join(' ')]),
    ...resume.experience.flatMap((item) => [item.company, item.role, item.description]),
    ...resume.certifications.flatMap((item) => [item.name, item.issuer])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const calculateResumeInsights = (resume) => {
  const sections = [
    Boolean(resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone),
    Boolean(resume.summary),
    resume.education.length > 0,
    resume.skills.technical.length > 0 || resume.skills.soft.length > 0,
    resume.projects.length > 0,
    resume.experience.length > 0,
    resume.certifications.length > 0,
    resume.achievements.length > 0,
    resume.extracurricular.length > 0,
    resume.languages.length > 0
  ];

  const completionScore = Math.round((sections.filter(Boolean).length / sections.length) * 100);
  const roleKeywords = getRoleKeywords(resume.targetRole);
  const resumeText = buildResumeText(resume);
  const matchedKeywords = roleKeywords.filter((keyword) => resumeText.includes(keyword));
  const missingKeywords = roleKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  let atsScore = Math.round(completionScore * 0.45);

  if (resume.summary.length >= 60) atsScore += 10;
  if (resume.skills.technical.length >= 5) atsScore += 10;
  if (resume.projects.length > 0) atsScore += 10;
  if (resume.experience.length > 0) atsScore += 10;
  if (resume.certifications.length > 0) atsScore += 5;
  if ([resume.personalInfo.linkedin, resume.personalInfo.github, resume.personalInfo.portfolio].filter(Boolean).length >= 2) {
    atsScore += 5;
  }

  atsScore += Math.min(20, matchedKeywords.length * 4);

  const suggestions = [];

  if (!resume.targetRole) {
    suggestions.push('Add a target role to unlock ATS keyword suggestions.');
  }

  if (!resume.summary || resume.summary.length < 60) {
    suggestions.push('Write a stronger career summary with impact-focused keywords.');
  }

  if (roleKeywords.length > 0 && missingKeywords.length > 0) {
    suggestions.push(`Consider adding role keywords like: ${missingKeywords.slice(0, 4).join(', ')}.`);
  }

  if (resume.projects.length === 0) {
    suggestions.push('Add at least one project with problem, stack, and outcome for stronger ATS coverage.');
  }

  if (resume.skills.technical.length < 5) {
    suggestions.push('List more technical skills relevant to your target role.');
  }

  return {
    atsScore: Math.min(100, atsScore),
    completionScore,
    suggestions,
    matchedKeywords
  };
};

const canAccessResume = (requestUser, ownerId) =>
  requestUser && (requestUser._id.toString() === ownerId.toString() || requestUser.isAdmin || ['admin', 'superadmin'].includes(requestUser.role));

const sendResumeResponse = (res, statusCode, resume, message) => {
  const insights = calculateResumeInsights(resume.toObject ? resume.toObject() : resume);

  return res.status(statusCode).json({
    success: true,
    message,
    resume,
    insights
  });
};

exports.createOrUpdateResume = async (req, res) => {
  try {
    const existingResume = await Resume.findOne({ userId: req.user._id });
    const normalizedResume = normalizeResumePayload(req.body, existingResume, req.user);
    const validationErrors = validateResumeDraft(normalizedResume);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    const insights = calculateResumeInsights(normalizedResume);

    if (existingResume) {
      Object.assign(existingResume, normalizedResume, insights);
      await existingResume.save();
      return sendResumeResponse(res, 200, existingResume, 'Resume updated successfully.');
    }

    const createdResume = await Resume.create({
      ...normalizedResume,
      userId: req.user._id,
      ...insights
    });

    return sendResumeResponse(res, 201, createdResume, 'Resume created successfully.');
  } catch (error) {
    console.error('Create/update resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save resume right now.',
      error: error.message
    });
  }
};

exports.getResumeByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id.'
      });
    }

    if (!canAccessResume(req.user, userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resume.'
      });
    }

    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    return sendResumeResponse(res, 200, resume, 'Resume fetched successfully.');
  } catch (error) {
    console.error('Get resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch resume right now.',
      error: error.message
    });
  }
};

exports.updateResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume id.'
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    if (!canAccessResume(req.user, resume.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resume.'
      });
    }

    const payload =
      req.body && cleanString(req.body.section) && hasOwn(req.body, 'data')
        ? { [cleanString(req.body.section)]: req.body.data }
        : req.body;

    const normalizedResume = normalizeResumePayload(payload, resume, req.user);
    const validationErrors = validateResumeDraft(normalizedResume);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    Object.assign(resume, normalizedResume, calculateResumeInsights(normalizedResume));
    await resume.save();

    return sendResumeResponse(res, 200, resume, 'Resume updated successfully.');
  } catch (error) {
    console.error('Update resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update resume right now.',
      error: error.message
    });
  }
};
