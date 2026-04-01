export const RESUME_STEPS = [
  { id: 'personal', title: 'Personal Information', shortLabel: 'Personal' },
  { id: 'summary', title: 'Career Summary', shortLabel: 'Summary' },
  { id: 'education', title: 'Education', shortLabel: 'Education' },
  { id: 'skills', title: 'Skills', shortLabel: 'Skills' },
  { id: 'projects', title: 'Projects', shortLabel: 'Projects' },
  { id: 'experience', title: 'Experience / Internships', shortLabel: 'Experience' },
  { id: 'certifications', title: 'Certifications', shortLabel: 'Certifications' },
  { id: 'achievements', title: 'Achievements', shortLabel: 'Achievements' },
  { id: 'extracurricular', title: 'Extra-Curricular Activities', shortLabel: 'Activities' },
  { id: 'languages', title: 'Languages', shortLabel: 'Languages' },
  { id: 'preview', title: 'Final Preview', shortLabel: 'Preview' }
];

export const RESUME_TEMPLATES = [
  { id: 'modern', name: 'Modern Slate', description: 'Balanced modern layout for placements.', layout: 'split', surface: 'light', hero: 'band', sectionStyle: 'line', font: 'sans' },
  { id: 'professional', name: 'Professional Prime', description: 'Clean recruiter-ready corporate template.', layout: 'sidebar', surface: 'paper', hero: 'boxed', sectionStyle: 'block', font: 'sans' },
  { id: 'modern-grid', name: 'Modern Grid', description: 'Sharper card rhythm with structured sections.', layout: 'split', surface: 'tint', hero: 'boxed', sectionStyle: 'block', font: 'sans' },
  { id: 'modern-minimal', name: 'Modern Minimal', description: 'Whitespace-first minimalist design.', layout: 'stacked', surface: 'paper', hero: 'minimal', sectionStyle: 'line', font: 'sans' },
  { id: 'classic', name: 'Classic Ivory', description: 'Traditional print-friendly fresher resume.', layout: 'stacked', surface: 'warm', hero: 'centered', sectionStyle: 'line', font: 'serif' },
  { id: 'classic-serif', name: 'Classic Serif', description: 'Elegant serif presentation with subtle accents.', layout: 'stacked', surface: 'paper', hero: 'minimal', sectionStyle: 'line', font: 'serif' },
  { id: 'classic-blue', name: 'Classic Blue', description: 'Conservative professional framing.', layout: 'sidebar', surface: 'paper', hero: 'stripe', sectionStyle: 'line', font: 'serif' },
  { id: 'executive', name: 'Executive Edge', description: 'High-contrast storytelling for leadership profiles.', layout: 'sidebar', surface: 'dark', hero: 'band', sectionStyle: 'block', font: 'sans' },
  { id: 'executive-dark', name: 'Executive Dark', description: 'Premium dark mode resume aesthetic.', layout: 'split', surface: 'dark', hero: 'boxed', sectionStyle: 'block', font: 'sans' },
  { id: 'executive-column', name: 'Executive Column', description: 'Two-column design for experience-heavy resumes.', layout: 'sidebar', surface: 'light', hero: 'boxed', sectionStyle: 'block', font: 'sans' },
  { id: 'creative-bloom', name: 'Creative Bloom', description: 'Softer gradients with a more expressive mood.', layout: 'split', surface: 'tint', hero: 'centered', sectionStyle: 'pill', font: 'sans' },
  { id: 'metro-line', name: 'Metro Line', description: 'Compact and linear for concise resumes.', layout: 'stacked', surface: 'light', hero: 'stripe', sectionStyle: 'line', font: 'sans' },
  { id: 'spotlight', name: 'Spotlight', description: 'Headline-forward with strong content cards.', layout: 'split', surface: 'warm', hero: 'boxed', sectionStyle: 'pill', font: 'sans' },
  { id: 'mono-pro', name: 'Mono Pro', description: 'Technical template for engineering profiles.', layout: 'stacked', surface: 'dark', hero: 'minimal', sectionStyle: 'line', font: 'mono' },
  { id: 'gradient-card', name: 'Gradient Card', description: 'Contemporary gradient framing and soft sections.', layout: 'split', surface: 'tint', hero: 'band', sectionStyle: 'pill', font: 'sans' },
  { id: 'clean-accent', name: 'Clean Accent', description: 'Minimal professional layout with crisp hierarchy.', layout: 'stacked', surface: 'light', hero: 'minimal', sectionStyle: 'block', font: 'sans' }
];

export const RESUME_THEMES = [
  { id: 'ocean', name: 'Ocean', accent: '#0f766e', soft: '#ccfbf1', ink: '#0f172a' },
  { id: 'royal', name: 'Royal', accent: '#4338ca', soft: '#e0e7ff', ink: '#172554' },
  { id: 'sunset', name: 'Sunset', accent: '#ea580c', soft: '#ffedd5', ink: '#7c2d12' },
  { id: 'forest', name: 'Forest', accent: '#166534', soft: '#dcfce7', ink: '#14532d' }
];

export const ROLE_KEYWORDS = {
  'software engineer': ['javascript', 'react', 'node', 'mongodb', 'api'],
  'full stack developer': ['frontend', 'backend', 'react', 'express', 'mongodb'],
  'frontend developer': ['react', 'tailwind', 'responsive', 'ui', 'performance'],
  'backend developer': ['node', 'express', 'mongodb', 'rest api', 'authentication'],
  'data analyst': ['sql', 'excel', 'python', 'dashboard', 'analysis'],
  'ui ux designer': ['figma', 'prototype', 'wireframes', 'usability', 'design system'],
  'qa engineer': ['testing', 'bug', 'automation', 'quality', 'selenium'],
  'devops engineer': ['docker', 'aws', 'ci/cd', 'linux', 'monitoring']
};

export const createEmptyEducation = () => ({ degree: '', college: '', year: '', cgpa: '' });
export const createEmptyProject = () => ({ title: '', description: '', techStack: [], githubLink: '', liveLink: '' });
export const createEmptyExperience = () => ({ company: '', role: '', duration: '', description: '' });
export const createEmptyCertification = () => ({ name: '', issuer: '', year: '', credentialId: '', link: '' });

const fallbackTheme = RESUME_THEMES[0];
const fallbackTemplate = RESUME_TEMPLATES[0];

export const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => `${item ?? ''}`.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const createDefaultResume = (user = null) => ({
  _id: null,
  personalInfo: {
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  targetRole: '',
  summary: '',
  education: [createEmptyEducation()],
  skills: {
    technical: normalizeStringList(user?.skills),
    soft: []
  },
  projects: Array.isArray(user?.projects) && user.projects.length > 0
    ? user.projects.map((item) => ({
        title: item.title || '',
        description: item.description || '',
        techStack: normalizeStringList(item.techStack || item.technologies),
        githubLink: item.githubLink || '',
        liveLink: item.liveLink || item.link || ''
      }))
    : [createEmptyProject()],
  experience: Array.isArray(user?.experience) && user.experience.length > 0
    ? user.experience.map((item) => ({
        company: item.company || '',
        role: item.role || item.position || '',
        duration: item.duration || [item.startDate, item.endDate].filter(Boolean).join(' - '),
        description: item.description || ''
      }))
    : [createEmptyExperience()],
  certifications: [createEmptyCertification()],
  achievements: [],
  extracurricular: [],
  languages: [],
  template: 'modern',
  theme: 'ocean',
  atsScore: 0,
  completionScore: 0,
  updatedAt: null
});

export const normalizeResumeResponse = (resume, user = null) => {
  if (!resume) {
    return createDefaultResume(user);
  }

  return {
    ...createDefaultResume(user),
    ...resume,
    personalInfo: {
      ...createDefaultResume(user).personalInfo,
      ...(resume.personalInfo || {})
    },
    education: Array.isArray(resume.education) && resume.education.length > 0 ? resume.education : [createEmptyEducation()],
    skills: {
      technical: normalizeStringList(resume.skills?.technical),
      soft: normalizeStringList(resume.skills?.soft)
    },
    projects: Array.isArray(resume.projects) && resume.projects.length > 0
      ? resume.projects.map((item) => ({ ...createEmptyProject(), ...item, techStack: normalizeStringList(item.techStack) }))
      : [createEmptyProject()],
    experience: Array.isArray(resume.experience) && resume.experience.length > 0
      ? resume.experience.map((item) => ({ ...createEmptyExperience(), ...item }))
      : [createEmptyExperience()],
    certifications: Array.isArray(resume.certifications) && resume.certifications.length > 0
      ? resume.certifications.map((item) => ({ ...createEmptyCertification(), ...item }))
      : [createEmptyCertification()],
    achievements: normalizeStringList(resume.achievements),
    extracurricular: normalizeStringList(resume.extracurricular),
    languages: normalizeStringList(resume.languages),
    template: resume.template || 'modern',
    theme: resume.theme || 'ocean'
  };
};

export const getRoleKeywordSuggestions = (targetRole) => {
  const normalizedRole = `${targetRole || ''}`.trim().toLowerCase();

  if (ROLE_KEYWORDS[normalizedRole]) {
    return ROLE_KEYWORDS[normalizedRole];
  }

  return Object.entries(ROLE_KEYWORDS).find(([role]) => normalizedRole.includes(role))?.[1] || [];
};

export const calculateResumeInsights = (resume) => {
  const sections = [
    Boolean(resume.personalInfo.fullName && resume.personalInfo.email && resume.personalInfo.phone),
    Boolean(resume.summary),
    resume.education.some((item) => item.degree || item.college),
    resume.skills.technical.length > 0 || resume.skills.soft.length > 0,
    resume.projects.some((item) => item.title || item.description),
    resume.experience.some((item) => item.company || item.role),
    resume.certifications.some((item) => item.name || item.issuer),
    resume.achievements.length > 0,
    resume.extracurricular.length > 0,
    resume.languages.length > 0
  ];

  const completionScore = Math.round((sections.filter(Boolean).length / sections.length) * 100);
  const keywordSuggestions = getRoleKeywordSuggestions(resume.targetRole);
  const searchText = [
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

  const matchedKeywords = keywordSuggestions.filter((keyword) => searchText.includes(keyword));
  const missingKeywords = keywordSuggestions.filter((keyword) => !matchedKeywords.includes(keyword));

  let atsScore = Math.round(completionScore * 0.45);
  if (resume.summary.trim().length >= 60) atsScore += 10;
  if (resume.skills.technical.length >= 5) atsScore += 10;
  if (resume.projects.some((item) => item.title)) atsScore += 10;
  if (resume.experience.some((item) => item.company || item.role)) atsScore += 10;
  if (resume.certifications.some((item) => item.name)) atsScore += 5;
  if ([resume.personalInfo.linkedin, resume.personalInfo.github, resume.personalInfo.portfolio].filter(Boolean).length >= 2) atsScore += 5;
  atsScore += Math.min(20, matchedKeywords.length * 4);

  const suggestions = [];
  if (!resume.targetRole.trim()) suggestions.push('Add a target role to unlock ATS keyword guidance.');
  if (resume.summary.trim().length < 60) suggestions.push('Write a stronger summary with impact and role-specific terms.');
  if (missingKeywords.length > 0) suggestions.push(`Missing target-role keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
  if (!resume.projects.some((item) => item.title)) suggestions.push('Add at least one project with measurable impact.');
  if (resume.skills.technical.length < 5) suggestions.push('List more relevant technical skills for better ATS coverage.');

  return {
    atsScore: Math.min(100, atsScore),
    completionScore,
    matchedKeywords,
    suggestions
  };
};

export const getTemplateTheme = (templateId, themeId) => {
  const template = RESUME_TEMPLATES.find((item) => item.id === templateId) || fallbackTemplate;
  const theme = RESUME_THEMES.find((item) => item.id === themeId) || fallbackTheme;
  const isDark = template.surface === 'dark';

  return {
    template,
    theme,
    isDark,
    surfaceClass: {
      light: 'bg-white text-slate-900',
      warm: 'bg-gradient-to-br from-amber-50 via-white to-stone-50 text-slate-900',
      paper: 'bg-stone-50 text-slate-900',
      tint: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-900',
      dark: 'bg-slate-950 text-white'
    }[template.surface],
    fontClass: {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono'
    }[template.font],
    contentGridClass: {
      stacked: 'grid-cols-1',
      split: 'lg:grid-cols-[0.95fr_1.05fr]',
      sidebar: 'lg:grid-cols-[0.78fr_1.22fr]'
    }[template.layout],
    cardClass: `rounded-[22px] border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-white/70'}`,
    primaryTextClass: isDark ? 'text-white' : 'text-slate-900',
    secondaryTextClass: isDark ? 'text-slate-300' : 'text-slate-600',
    tertiaryTextClass: isDark ? 'text-slate-400' : 'text-slate-500'
  };
};

export const buildResumeFileName = (fullName) => {
  const slug = `${fullName || 'resume'}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'resume'}.pdf`;
};
