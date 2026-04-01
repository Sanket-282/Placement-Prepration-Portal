import { useEffect, useRef, useState } from 'react';
import {
  Award,
  Briefcase,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const STORAGE_KEYS = {
  template: 'resume-builder-template',
  theme: 'resume-builder-theme'
};

const emptyEducation = () => ({
  institution: '',
  degree: '',
  field: '',
  startYear: '',
  endYear: '',
  percentage: ''
});

const emptyProject = () => ({
  title: '',
  description: '',
  technologies: '',
  link: ''
});

const emptyExperience = () => ({
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: ''
});

const emptyCertification = () => ({
  name: '',
  issuer: '',
  issueDate: '',
  credentialId: '',
  link: ''
});

const templateOptions = [
  {
    id: 'modern',
    name: 'Modern Slate',
    description: 'Bold header, crisp spacing, and a premium ATS-friendly layout.',
    layout: 'split',
    surface: 'light',
    hero: 'band',
    sectionStyle: 'line',
    font: 'sans'
  },
  {
    id: 'modern-grid',
    name: 'Modern Grid',
    description: 'Structured cards with sharper blocks for high-clarity resumes.',
    layout: 'split',
    surface: 'tint',
    hero: 'boxed',
    sectionStyle: 'block',
    font: 'sans'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'A lighter single-column layout focused on whitespace and readability.',
    layout: 'stacked',
    surface: 'paper',
    hero: 'minimal',
    sectionStyle: 'line',
    font: 'sans'
  },
  {
    id: 'classic',
    name: 'Classic Ivory',
    description: 'Traditional section flow for internships, placements, and fresher resumes.',
    layout: 'stacked',
    surface: 'warm',
    hero: 'centered',
    sectionStyle: 'line',
    font: 'serif'
  },
  {
    id: 'classic-serif',
    name: 'Classic Serif',
    description: 'Print-inspired styling with elegant typography and subtle accents.',
    layout: 'stacked',
    surface: 'paper',
    hero: 'minimal',
    sectionStyle: 'line',
    font: 'serif'
  },
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'Conservative professional framing with a calm accent stripe.',
    layout: 'sidebar',
    surface: 'paper',
    hero: 'stripe',
    sectionStyle: 'line',
    font: 'serif'
  },
  {
    id: 'executive',
    name: 'Executive Edge',
    description: 'A denser two-column structure for stronger professional storytelling.',
    layout: 'sidebar',
    surface: 'dark',
    hero: 'band',
    sectionStyle: 'block',
    font: 'sans'
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    description: 'High-contrast leadership profile with stronger visual depth.',
    layout: 'split',
    surface: 'dark',
    hero: 'boxed',
    sectionStyle: 'block',
    font: 'sans'
  },
  {
    id: 'executive-column',
    name: 'Executive Column',
    description: 'Balanced two-column presentation for experience-heavy resumes.',
    layout: 'sidebar',
    surface: 'light',
    hero: 'boxed',
    sectionStyle: 'block',
    font: 'sans'
  },
  {
    id: 'creative-bloom',
    name: 'Creative Bloom',
    description: 'Soft gradients and friendly cards for a more expressive profile.',
    layout: 'split',
    surface: 'tint',
    hero: 'centered',
    sectionStyle: 'pill',
    font: 'sans'
  },
  {
    id: 'metro-line',
    name: 'Metro Line',
    description: 'Linear rhythm and compact sections suited to concise resumes.',
    layout: 'stacked',
    surface: 'light',
    hero: 'stripe',
    sectionStyle: 'line',
    font: 'sans'
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Strong headline treatment with crisp content blocks below.',
    layout: 'split',
    surface: 'warm',
    hero: 'boxed',
    sectionStyle: 'pill',
    font: 'sans'
  },
  {
    id: 'mono-pro',
    name: 'Mono Pro',
    description: 'Technical, minimalist, and sharp for engineering-first resumes.',
    layout: 'stacked',
    surface: 'dark',
    hero: 'minimal',
    sectionStyle: 'line',
    font: 'mono'
  },
  {
    id: 'gradient-card',
    name: 'Gradient Card',
    description: 'Contemporary gradient framing with polished section cards.',
    layout: 'split',
    surface: 'tint',
    hero: 'band',
    sectionStyle: 'pill',
    font: 'sans'
  },
  {
    id: 'clean-accent',
    name: 'Clean Accent',
    description: 'Simple modern resume with subtle accents and strong hierarchy.',
    layout: 'stacked',
    surface: 'light',
    hero: 'minimal',
    sectionStyle: 'block',
    font: 'sans'
  }
];

const themeOptions = [
  { id: 'ocean', name: 'Ocean', accent: '#0f766e', soft: '#ccfbf1', ink: '#0f172a' },
  { id: 'royal', name: 'Royal', accent: '#4338ca', soft: '#e0e7ff', ink: '#172554' },
  { id: 'sunset', name: 'Sunset', accent: '#ea580c', soft: '#ffedd5', ink: '#7c2d12' },
  { id: 'forest', name: 'Forest', accent: '#166534', soft: '#dcfce7', ink: '#14532d' }
];

const getTheme = (themeId) => themeOptions.find((theme) => theme.id === themeId) || themeOptions[0];
const getTemplateConfig = (templateId) => templateOptions.find((template) => template.id === templateId) || templateOptions[0];

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatRange = (start, end) => {
  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || '';
};

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getPreviewTokens = (templateId, theme) => {
  const config = getTemplateConfig(templateId);
  const isDark = config.surface === 'dark';

  const surfaceClasses = {
    light: 'bg-white text-slate-900',
    warm: 'bg-gradient-to-br from-amber-50 via-white to-stone-50 text-slate-900',
    paper: 'bg-stone-50 text-slate-900',
    tint: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-900',
    dark: 'bg-slate-950 text-white'
  };

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  const heroInnerClasses = {
    band: `grid gap-6 ${config.layout === 'stacked' ? '' : 'lg:grid-cols-[1.2fr_0.9fr]'}`,
    boxed: `grid gap-5 ${config.layout === 'stacked' ? '' : 'lg:grid-cols-[1.05fr_0.95fr]'}`,
    centered: 'text-center',
    minimal: 'grid gap-5',
    stripe: `grid gap-6 ${config.layout === 'stacked' ? '' : 'lg:grid-cols-[1.1fr_0.9fr]'}`
  };

  const heroStyles = {
    band: {
      background: isDark
        ? `linear-gradient(135deg, ${theme.ink} 0%, #0f172a 55%, #020617 100%)`
        : `linear-gradient(135deg, ${theme.soft} 0%, #ffffff 72%)`,
      borderBottom: `4px solid ${theme.accent}`
    },
    boxed: {
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
        : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.2)'}`
    },
    centered: {
      background: isDark
        ? `radial-gradient(circle at top, rgba(255,255,255,0.08), rgba(15,23,42,0.95) 62%)`
        : `linear-gradient(180deg, ${theme.soft} 0%, #ffffff 100%)`,
      borderBottom: `3px solid ${theme.accent}`
    },
    minimal: {
      background: isDark ? '#020617' : '#ffffff',
      borderTop: `5px solid ${theme.accent}`
    },
    stripe: {
      background: isDark ? '#0f172a' : '#ffffff',
      borderLeft: `6px solid ${theme.accent}`
    }
  };

  const summaryClasses = {
    band: `rounded-[22px] border p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-white bg-white/80'}`,
    boxed: `rounded-[24px] border p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/90'}`,
    centered: `mx-auto mt-6 max-w-3xl rounded-[24px] border p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-white bg-white/80'}`,
    minimal: `rounded-[18px] border p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`,
    stripe: `rounded-[22px] border p-5 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/90'}`
  };

  const contentGridClasses = {
    stacked: 'grid-cols-1',
    split: 'lg:grid-cols-[0.95fr_1.05fr]',
    sidebar: 'lg:grid-cols-[0.78fr_1.22fr]'
  };

  const sectionTitleClasses = {
    line: `${isDark ? 'text-slate-300' : 'text-slate-500'} mb-4 border-b pb-2 text-xs font-bold uppercase tracking-[0.25em] ${isDark ? 'border-white/10' : 'border-slate-200'}`,
    block: `mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'}`,
    pill: 'mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]'
  };

  const cardClass = `rounded-[22px] border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200/80 bg-white/70'}`;

  return {
    config,
    isDark,
    surfaceClass: surfaceClasses[config.surface],
    fontClass: fontClasses[config.font],
    heroInnerClass: heroInnerClasses[config.hero],
    heroStyle: heroStyles[config.hero],
    summaryClass: summaryClasses[config.hero],
    contentGridClass: contentGridClasses[config.layout],
    sectionTitleClass: sectionTitleClasses[config.sectionStyle],
    cardClass,
    primaryTextClass: isDark ? 'text-white' : 'text-slate-900',
    secondaryTextClass: isDark ? 'text-slate-300' : 'text-slate-600',
    tertiaryTextClass: isDark ? 'text-slate-400' : 'text-slate-500'
  };
};

const getPrintTokens = (templateId, theme) => {
  const config = getTemplateConfig(templateId);
  const isDark = config.surface === 'dark';

  const pageBackgrounds = {
    light: '#ffffff',
    warm: '#fffaf2',
    paper: '#fafaf9',
    tint: '#f8fbff',
    dark: '#020617'
  };

  const bodyBackgrounds = {
    light: '#f8fafc',
    warm: '#fdf6ec',
    paper: '#f7f5f1',
    tint: '#f4f8ff',
    dark: '#020617'
  };

  const fontFamilies = {
    sans: 'Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"Courier New", monospace'
  };

  const heroBackgrounds = {
    band: isDark ? `linear-gradient(135deg, ${theme.ink}, #020617)` : `linear-gradient(135deg, ${theme.soft}, #ffffff 72%)`,
    boxed: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    centered: isDark ? `radial-gradient(circle at top, rgba(255,255,255,0.08), #020617 65%)` : `linear-gradient(180deg, ${theme.soft}, #ffffff)`,
    minimal: isDark ? '#020617' : '#ffffff',
    stripe: isDark ? '#0f172a' : '#ffffff'
  };

  const heroRule = {
    band: `border-bottom: 4px solid ${theme.accent};`,
    boxed: `border: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'};`,
    centered: `border-bottom: 3px solid ${theme.accent}; text-align: center;`,
    minimal: `border-top: 5px solid ${theme.accent};`,
    stripe: `border-left: 6px solid ${theme.accent};`
  };

  const summaryBackground = isDark ? 'rgba(255,255,255,0.05)' : config.hero === 'band' || config.hero === 'centered' ? 'rgba(255,255,255,0.82)' : '#f8fafc';
  const sectionTitleRule = {
    line: `border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}; padding-bottom: 8px;`,
    block: `display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${isDark ? 'rgba(255,255,255,0.1)' : '#0f172a'}; color: #ffffff;`,
    pill: `display: inline-block; padding: 6px 12px; border-radius: 999px; background: ${theme.soft}; color: ${theme.ink};`
  };

  return {
    config,
    isDark,
    pageBackground: pageBackgrounds[config.surface],
    bodyBackground: bodyBackgrounds[config.surface],
    fontFamily: fontFamilies[config.font],
    textColor: isDark ? '#ffffff' : '#0f172a',
    mutedColor: isDark ? '#cbd5e1' : '#475569',
    softTextColor: isDark ? '#94a3b8' : '#64748b',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    cardBackground: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    heroBackground: heroBackgrounds[config.hero],
    heroRule: heroRule[config.hero],
    summaryBackground,
    contentDisplay: config.layout === 'stacked' ? 'block' : 'grid',
    contentColumns: config.layout === 'sidebar' ? '0.8fr 1.2fr' : '0.95fr 1.05fr',
    sectionTitleRule: sectionTitleRule[config.sectionStyle],
    chipBackground: config.sectionStyle === 'pill' ? theme.accent : theme.soft,
    chipColor: config.sectionStyle === 'pill' ? '#ffffff' : theme.ink
  };
};

const buildPrintMarkup = (resume, template, theme) => {
  const filledEducation = resume.education.filter((item) => item.institution || item.degree);
  const filledProjects = resume.projects.filter((item) => item.title);
  const filledExperience = resume.experience.filter((item) => item.company || item.position);
  const filledCertifications = (resume.certifications || []).filter((item) => item.name || item.issuer);
  const skills = normalizeList(resume.skills);
  const contactLine = [resume.email, resume.phone, resume.location].filter(Boolean).join(' | ');
  const links = normalizeList(resume.links);
  const tokens = getPrintTokens(template, theme);

  const renderList = (items, mapper) => items.map(mapper).join('');

  return `
    <html>
      <head>
        <title>${escapeHtml(resume.name || 'Resume')}</title>
        <style>
          @page { size: A4; margin: 0; }
          * { box-sizing: border-box; }
          html, body, .page, .hero, .summary-box, .item, .chip {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            margin: 0;
            font-family: ${tokens.fontFamily};
            background: ${tokens.bodyBackground};
            color: ${tokens.textColor};
          }
          .page {
            max-width: 860px;
            margin: 0 auto;
            background: ${tokens.pageBackground};
            min-height: 100vh;
          }
          .hero {
            padding: 36px 42px 28px;
            background: ${tokens.heroBackground};
            ${tokens.heroRule}
          }
          .hero-inner {
            display: ${tokens.config.hero === 'centered' ? 'block' : tokens.config.layout === 'stacked' ? 'block' : 'grid'};
            grid-template-columns: ${tokens.config.hero === 'centered' || tokens.config.layout === 'stacked' ? '1fr' : '1.15fr 0.95fr'};
            gap: 20px;
            align-items: start;
          }
          .name { font-size: 34px; font-weight: 700; color: ${tokens.textColor}; margin: 0 0 8px; }
          .summary-box {
            margin-top: ${tokens.config.hero === 'centered' ? '20px' : '0'};
            padding: 18px 20px;
            border-radius: 18px;
            background: ${tokens.summaryBackground};
            border: 1px solid ${tokens.borderColor};
          }
          .summary { margin: 0; color: ${tokens.mutedColor}; line-height: 1.7; font-size: 14px; }
          .meta { color: ${tokens.mutedColor}; font-size: 13px; line-height: 1.8; }
          .body {
            padding: 32px 42px 36px;
            display: ${tokens.contentDisplay};
            grid-template-columns: ${tokens.contentColumns};
            gap: 28px;
          }
          .section { margin-bottom: 26px; }
          .section-title {
            margin: 0 0 12px;
            color: ${tokens.textColor};
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            ${tokens.sectionTitleRule}
          }
          .item {
            margin-bottom: 14px;
            padding: ${tokens.config.sectionStyle === 'line' ? '0' : '14px 16px'};
            border: ${tokens.config.sectionStyle === 'line' ? '0' : `1px solid ${tokens.borderColor}`};
            border-radius: ${tokens.config.sectionStyle === 'pill' ? '18px' : '16px'};
            background: ${tokens.config.sectionStyle === 'line' ? 'transparent' : tokens.cardBackground};
          }
          .item-head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            font-size: 14px;
            color: ${tokens.textColor};
            font-weight: 700;
          }
          .sub { margin-top: 4px; color: ${tokens.mutedColor}; font-size: 13px; }
          .desc { margin-top: 6px; color: ${tokens.softTextColor}; font-size: 13px; line-height: 1.7; }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; }
          .chip {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            background: ${tokens.chipBackground};
            color: ${tokens.chipColor};
            font-size: 12px;
            font-weight: 700;
          }
          a { color: ${theme.accent}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="hero">
            <div class="hero-inner">
              <div>
                <h1 class="name">${escapeHtml(resume.name || 'Your Name')}</h1>
                <div class="meta">${escapeHtml(contactLine || 'Email | Phone | Location')}</div>
                ${links.length ? `<div class="meta">${links.map((link) => escapeHtml(link)).join(' | ')}</div>` : ''}
              </div>
              ${resume.summary ? `<div class="summary-box"><p class="summary">${escapeHtml(resume.summary)}</p></div>` : ''}
            </div>
          </div>
          <div class="body">
            <div>
              ${skills.length ? `
                <section class="section">
                  <h2 class="section-title">Skills</h2>
                  <div class="chips">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join('')}</div>
                </section>
              ` : ''}
              ${filledEducation.length ? `
                <section class="section">
                  <h2 class="section-title">Education</h2>
                  ${renderList(filledEducation, (edu) => `
                    <div class="item">
                      <div class="item-head">
                        <span>${escapeHtml(edu.institution || edu.degree || 'Education')}</span>
                        <span>${escapeHtml(formatRange(edu.startYear, edu.endYear))}</span>
                      </div>
                      <div class="sub">${escapeHtml([edu.degree, edu.field].filter(Boolean).join(' | '))}</div>
                      ${edu.percentage ? `<div class="desc">${escapeHtml(`Score: ${edu.percentage}`)}</div>` : ''}
                    </div>
                  `)}
                </section>
              ` : ''}
              ${filledCertifications.length ? `
                <section class="section">
                  <h2 class="section-title">Certifications</h2>
                  ${renderList(filledCertifications, (certification) => `
                    <div class="item">
                      <div class="item-head">
                        <span>${escapeHtml(certification.name || 'Certification')}</span>
                        <span>${escapeHtml(certification.issueDate || '')}</span>
                      </div>
                      <div class="sub">${escapeHtml(certification.issuer || '')}</div>
                      ${certification.credentialId ? `<div class="desc">${escapeHtml(`Credential ID: ${certification.credentialId}`)}</div>` : ''}
                      ${certification.link ? `<div class="desc"><a href="${escapeHtml(certification.link)}">${escapeHtml(certification.link)}</a></div>` : ''}
                    </div>
                  `)}
                </section>
              ` : ''}
            </div>
            <div>
              ${filledExperience.length ? `
                <section class="section">
                  <h2 class="section-title">Experience</h2>
                  ${renderList(filledExperience, (exp) => `
                    <div class="item">
                      <div class="item-head">
                        <span>${escapeHtml(exp.position || exp.company || 'Experience')}</span>
                        <span>${escapeHtml(formatRange(exp.startDate, exp.endDate))}</span>
                      </div>
                      <div class="sub">${escapeHtml(exp.company || '')}</div>
                      ${exp.description ? `<div class="desc">${escapeHtml(exp.description)}</div>` : ''}
                    </div>
                  `)}
                </section>
              ` : ''}
              ${filledProjects.length ? `
                <section class="section">
                  <h2 class="section-title">Projects</h2>
                  ${renderList(filledProjects, (project) => `
                    <div class="item">
                      <div class="item-head">
                        <span>${escapeHtml(project.title)}</span>
                        <span>${project.link ? `<a href="${escapeHtml(project.link)}">${escapeHtml(project.link)}</a>` : ''}</span>
                      </div>
                      ${project.technologies ? `<div class="sub">${escapeHtml(project.technologies)}</div>` : ''}
                      ${project.description ? `<div class="desc">${escapeHtml(project.description)}</div>` : ''}
                    </div>
                  `)}
                </section>
              ` : ''}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const buildResumeFileName = (name) => {
  const slug = (name || 'resume')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'resume'}.pdf`;
};

const ResumePreview = ({ resume, template, theme }) => {
  const filledEducation = resume.education.filter((item) => item.institution || item.degree);
  const filledProjects = resume.projects.filter((item) => item.title);
  const filledExperience = resume.experience.filter((item) => item.company || item.position);
  const filledCertifications = (resume.certifications || []).filter((item) => item.name || item.issuer);
  const skills = normalizeList(resume.skills);
  const links = normalizeList(resume.links);

  const tokens = getPreviewTokens(template, theme);

  return (
    <div className={`min-h-[960px] rounded-[28px] p-8 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.45)] ${tokens.surfaceClass} ${tokens.fontClass}`}>
      <div
        className="rounded-[24px] p-8"
        style={tokens.heroStyle}
      >
        <div className={tokens.heroInnerClass}>
          <div className={tokens.config.hero === 'centered' ? 'text-center' : ''}>
            <h1 className={`text-4xl font-black ${tokens.primaryTextClass}`}>
              {resume.name || 'Your Name'}
            </h1>
            <p className={`mt-3 text-sm ${tokens.secondaryTextClass}`}>
              {[resume.email, resume.phone, resume.location].filter(Boolean).join(' | ') || 'email@example.com | +91 98765 43210 | Pune, India'}
            </p>
            {links.length > 0 && (
              <p className={`mt-2 text-sm ${tokens.tertiaryTextClass}`}>
                {links.join(' | ')}
              </p>
            )}
          </div>
          <div className={tokens.summaryClass}>
            <p className={`text-sm leading-7 ${tokens.secondaryTextClass}`}>
              {resume.summary || 'Add a sharp career summary that explains your strengths, target role, and impact in a few lines.'}
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-8 grid gap-8 ${tokens.contentGridClass}`}>
        <div>
          <h3 className={tokens.sectionTitleClass} style={tokens.config.sectionStyle === 'pill' ? { backgroundColor: theme.soft, color: theme.ink } : undefined}>Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{
                    backgroundColor: tokens.config.sectionStyle === 'pill' ? theme.accent : theme.soft,
                    color: tokens.config.sectionStyle === 'pill' ? '#ffffff' : theme.ink
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className={`text-sm ${tokens.tertiaryTextClass}`}>Add your primary tools, languages, and strengths.</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className={tokens.sectionTitleClass} style={tokens.config.sectionStyle === 'pill' ? { backgroundColor: theme.soft, color: theme.ink } : undefined}>Education</h3>
            <div className="space-y-4">
              {filledEducation.length > 0 ? (
                filledEducation.map((edu, index) => (
                  <div key={`${edu.institution}-${index}`} className={tokens.cardClass}>
                    <div className={`flex items-start justify-between gap-4 ${tokens.primaryTextClass}`}>
                      <div>
                        <p className="font-bold">{edu.institution || 'Institution'}</p>
                        <p className={`mt-1 text-sm ${tokens.secondaryTextClass}`}>
                          {[edu.degree, edu.field].filter(Boolean).join(' | ') || 'Degree | Stream'}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ${tokens.tertiaryTextClass}`}>
                        {formatRange(edu.startYear, edu.endYear) || 'Timeline'}
                      </p>
                    </div>
                    {edu.percentage && (
                      <p className={`mt-2 text-sm ${tokens.tertiaryTextClass}`}>
                        Score: {edu.percentage}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${tokens.tertiaryTextClass}`}>Add your academic background to populate this section.</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className={tokens.sectionTitleClass} style={tokens.config.sectionStyle === 'pill' ? { backgroundColor: theme.soft, color: theme.ink } : undefined}>Certifications</h3>
            <div className="space-y-4">
              {filledCertifications.length > 0 ? (
                filledCertifications.map((certification, index) => (
                  <div key={`${certification.name}-${index}`} className={tokens.cardClass}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-bold ${tokens.primaryTextClass}`}>{certification.name || 'Certification'}</p>
                        <p className={`mt-1 text-sm ${tokens.secondaryTextClass}`}>{certification.issuer || 'Issuer'}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tokens.tertiaryTextClass}`}>
                        {certification.issueDate || 'Issue date'}
                      </p>
                    </div>
                    {certification.credentialId && (
                      <p className={`mt-2 text-sm ${tokens.tertiaryTextClass}`}>Credential ID: {certification.credentialId}</p>
                    )}
                    {certification.link && (
                      <a
                        href={certification.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-semibold"
                        style={{ color: theme.accent }}
                      >
                        View credential
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${tokens.tertiaryTextClass}`}>Add certificates, licenses, or workshop credentials to strengthen your profile.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className={tokens.sectionTitleClass} style={tokens.config.sectionStyle === 'pill' ? { backgroundColor: theme.soft, color: theme.ink } : undefined}>Experience</h3>
          <div className="space-y-4">
            {filledExperience.length > 0 ? (
              filledExperience.map((exp, index) => (
                <div key={`${exp.company}-${index}`} className={tokens.cardClass}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`font-bold ${tokens.primaryTextClass}`}>{exp.position || 'Role'}</p>
                      <p className={`mt-1 text-sm ${tokens.secondaryTextClass}`}>{exp.company || 'Company name'}</p>
                    </div>
                    <p className={`text-sm font-semibold ${tokens.tertiaryTextClass}`}>
                      {formatRange(exp.startDate, exp.endDate) || 'Timeline'}
                    </p>
                  </div>
                  {exp.description && (
                    <p className={`mt-3 text-sm leading-7 ${tokens.secondaryTextClass}`}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className={`text-sm ${tokens.tertiaryTextClass}`}>Internships, training, and leadership experience can all live here.</p>
            )}
          </div>

          <div className="mt-8">
            <h3 className={tokens.sectionTitleClass} style={tokens.config.sectionStyle === 'pill' ? { backgroundColor: theme.soft, color: theme.ink } : undefined}>Projects</h3>
            <div className="space-y-4">
              {filledProjects.length > 0 ? (
                filledProjects.map((project, index) => (
                  <div key={`${project.title}-${index}`} className={tokens.cardClass}>
                    <div className="flex items-start justify-between gap-4">
                      <p className={`font-bold ${tokens.primaryTextClass}`}>{project.title}</p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold"
                          style={{ color: theme.accent }}
                        >
                          Live
                        </a>
                      )}
                    </div>
                    {project.technologies && (
                      <p className={`mt-1 text-sm ${tokens.secondaryTextClass}`}>{project.technologies}</p>
                    )}
                    {project.description && (
                      <p className={`mt-3 text-sm leading-7 ${tokens.secondaryTextClass}`}>{project.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${tokens.tertiaryTextClass}`}>Showcase strong projects with outcome-focused descriptions and tech stacks.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvancedResumeBuilder = () => {
  const { user } = useAuth();
  const previewRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState('');
  const [template, setTemplate] = useState(localStorage.getItem(STORAGE_KEYS.template) || 'modern');
  const [themeId, setThemeId] = useState(localStorage.getItem(STORAGE_KEYS.theme) || 'ocean');
  const [resumeData, setResumeData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: [user?.contactInfo?.city, user?.contactInfo?.state, user?.contactInfo?.country].filter(Boolean).join(', '),
    summary: user?.summary || '',
    links: normalizeList(user?.weblinks),
    skills: normalizeList(user?.skills),
    certifications: Array.isArray(user?.certifications) && user.certifications.length > 0 ? user.certifications : [emptyCertification()],
    education: Array.isArray(user?.education) && user.education.length > 0 ? user.education : [emptyEducation()],
    projects: Array.isArray(user?.projects) && user.projects.length > 0 ? user.projects : [emptyProject()],
    experience: Array.isArray(user?.experience) && user.experience.length > 0 ? user.experience : [emptyExperience()]
  });

  const theme = getTheme(themeId);
  const completedChecks = [
    Boolean(resumeData.name),
    Boolean(resumeData.email),
    Boolean(resumeData.phone),
    Boolean(resumeData.summary),
    normalizeList(resumeData.skills).length > 0,
    resumeData.certifications.some((item) => item.name || item.issuer),
    resumeData.education.some((item) => item.institution || item.degree),
    resumeData.projects.some((item) => item.title),
    resumeData.experience.some((item) => item.company || item.position)
  ];
  const completionStats = {
    completed: completedChecks.filter(Boolean).length,
    total: completedChecks.length,
    percent: Math.round((completedChecks.filter(Boolean).length / completedChecks.length) * 100)
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.template, template);
  }, [template]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, themeId);
  }, [themeId]);

  const updateField = (name, value) => {
    setResumeData((current) => ({ ...current, [name]: value }));
  };

  const updateSectionItem = (section, index, name, value) => {
    setResumeData((current) => {
      const updatedSection = [...current[section]];
      updatedSection[index] = { ...updatedSection[index], [name]: value };
      return { ...current, [section]: updatedSection };
    });
  };

  const addSectionItem = (section) => {
    const factoryMap = {
      certifications: emptyCertification,
      education: emptyEducation,
      projects: emptyProject,
      experience: emptyExperience
    };

    setResumeData((current) => ({
      ...current,
      [section]: [...current[section], factoryMap[section]()]
    }));
  };

  const removeSectionItem = (section, index) => {
    setResumeData((current) => {
      const updatedSection = current[section].filter((_, itemIndex) => itemIndex !== index);
      const emptyStateMap = {
        certifications: emptyCertification(),
        education: emptyEducation(),
        projects: emptyProject(),
        experience: emptyExperience()
      };

      return {
        ...current,
        [section]: updatedSection.length > 0 ? updatedSection : [emptyStateMap[section]]
      };
    });
  };

  const addChipItem = (field, value, setter) => {
    const cleanedValue = value.trim();

    if (!cleanedValue) {
      return;
    }

    setResumeData((current) => ({
      ...current,
      [field]: [...normalizeList(current[field]), cleanedValue]
    }));
    setter('');
  };

  const removeChipItem = (field, valueToRemove) => {
    setResumeData((current) => ({
      ...current,
      [field]: normalizeList(current[field]).filter((item) => item !== valueToRemove)
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const [city = '', state = '', country = ''] = (resumeData.location || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      await userAPI.updateProfile({
        name: resumeData.name,
        email: resumeData.email,
        phone: resumeData.phone,
        summary: resumeData.summary,
        skills: normalizeList(resumeData.skills),
        certifications: resumeData.certifications,
        education: resumeData.education,
        projects: resumeData.projects,
        experience: resumeData.experience,
        weblinks: normalizeList(resumeData.links),
        contactInfo: {
          city,
          state,
          country
        }
      });

      window.alert('Resume data saved successfully.');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Failed to save resume data.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    let exportHost = null;

    try {
      const previewElement = previewRef.current;

      if (!previewElement) {
        throw new Error('Resume preview not available');
      }

      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      exportHost = document.createElement('div');
      exportHost.style.position = 'fixed';
      exportHost.style.left = '-10000px';
      exportHost.style.top = '0';
      exportHost.style.width = '794px';
      exportHost.style.background = '#ffffff';
      exportHost.style.padding = '0';
      exportHost.style.zIndex = '-1';

      const exportNode = previewElement.cloneNode(true);
      exportNode.style.width = '794px';
      exportNode.style.maxWidth = '794px';
      exportNode.style.overflow = 'visible';

      const previewPage = exportNode.firstElementChild;

      if (previewPage) {
        previewPage.style.minHeight = '1123px';
        previewPage.style.borderRadius = '0';
        previewPage.style.boxShadow = 'none';
      }

      exportHost.appendChild(exportNode);
      document.body.appendChild(exportHost);

      await html2pdf()
        .set({
          filename: buildResumeFileName(resumeData.name),
          margin: [0, 0, 0, 0],
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: {
            unit: 'pt',
            format: 'a4',
            orientation: 'portrait'
          },
          pagebreak: {
            mode: ['css', 'legacy']
          }
        })
        .from(exportNode)
        .save();

      document.body.removeChild(exportHost);
    } catch (error) {
      try {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
          throw new Error('Popup blocked');
        }

        printWindow.document.write(buildPrintMarkup(resumeData, template, theme));
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } catch (fallbackError) {
        window.alert('Unable to download the resume right now. Please try again.');
      }
    } finally {
      if (exportHost && document.body.contains(exportHost)) {
        exportHost.remove();
      }

      setDownloading(false);
    }
  };

  const sectionCardClass = 'rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur';
  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100';
  const textareaClass = `${inputClass} min-h-[120px] resize-y`;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.65)]">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Badge className="mb-4 border-0 bg-white/10 text-white">Advanced Resume Builder</Badge>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Build polished placement-ready resumes with live templates and a premium editor.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Choose a layout, tune the visual theme, edit every core section, and download a clean print-ready version without leaving your existing portal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" className="border-0 bg-white text-slate-900 hover:bg-slate-100" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Resume Data
              </Button>
              <Button className="border-0 bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-95" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Resume
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-slate-300">Profile Completion</p>
                  <p className="text-2xl font-black">{completionStats.percent}%</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3"><FileText className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-slate-300">Templates</p>
                  <p className="text-2xl font-black">{templateOptions.length}</p>
                </div>
              </div>
            </Card>
            <Card className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3"><Palette className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-slate-300">Visual Themes</p>
                  <p className="text-2xl font-black">{themeOptions.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className={sectionCardClass}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white"><Wand2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Template Studio</h2>
                <p className="text-sm text-slate-500">Pick a layout and theme before you fine-tune content.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templateOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTemplate(option.id)}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    template === option.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xl'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <p className="text-sm font-black">{option.name}</p>
                  <p className={`mt-2 text-sm leading-6 ${template === option.id ? 'text-slate-300' : 'text-slate-500'}`}>{option.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setThemeId(option.id)}
                  className={`rounded-[22px] border p-4 text-left transition ${
                    themeId === option.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mb-3 flex gap-2">
                    <span className="h-6 w-6 rounded-full" style={{ backgroundColor: option.accent }} />
                    <span className="h-6 w-6 rounded-full" style={{ backgroundColor: option.soft }} />
                  </div>
                  <p className="text-sm font-bold">{option.name}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className={sectionCardClass}>
            <h2 className="mb-5 text-xl font-bold text-slate-900">Personal Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} value={resumeData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Full Name" />
              <input className={inputClass} type="email" value={resumeData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email Address" />
              <input className={inputClass} value={resumeData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone Number" />
              <input className={inputClass} value={resumeData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="City, State, Country" />
            </div>
            <textarea className={`${textareaClass} mt-4`} value={resumeData.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write a concise professional summary focused on role, strengths, and outcomes." />
          </Card>

          <Card className={sectionCardClass}>
            <h2 className="mb-5 text-xl font-bold text-slate-900">Skills and Links</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addChipItem('skills', newSkill, setNewSkill)}
                    placeholder="Add skill"
                  />
                  <Button className="rounded-2xl" onClick={() => addChipItem('skills', newSkill, setNewSkill)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {normalizeList(resumeData.skills).map((skill, index) => (
                    <span key={`${skill}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {skill}
                      <button type="button" onClick={() => removeChipItem('skills', skill)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addChipItem('links', newLink, setNewLink)}
                    placeholder="Add portfolio, GitHub, LinkedIn..."
                  />
                  <Button className="rounded-2xl" onClick={() => addChipItem('links', newLink, setNewLink)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {normalizeList(resumeData.links).map((link, index) => (
                    <span key={`${link}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                      {link}
                      <button type="button" onClick={() => removeChipItem('links', link)} className="text-indigo-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className={sectionCardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><GraduationCap className="h-5 w-5" /> Education</h2>
              <Button variant="secondary" className="rounded-2xl" onClick={() => addSectionItem('education')}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map((item, index) => (
                <div key={`education-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className={inputClass} value={item.institution} onChange={(e) => updateSectionItem('education', index, 'institution', e.target.value)} placeholder="Institution" />
                    <input className={inputClass} value={item.degree} onChange={(e) => updateSectionItem('education', index, 'degree', e.target.value)} placeholder="Degree" />
                    <input className={inputClass} value={item.field} onChange={(e) => updateSectionItem('education', index, 'field', e.target.value)} placeholder="Field of Study" />
                    <input className={inputClass} value={item.percentage} onChange={(e) => updateSectionItem('education', index, 'percentage', e.target.value)} placeholder="Score / CGPA" />
                    <input className={inputClass} value={item.startYear} onChange={(e) => updateSectionItem('education', index, 'startYear', e.target.value)} placeholder="Start Year" />
                    <input className={inputClass} value={item.endYear} onChange={(e) => updateSectionItem('education', index, 'endYear', e.target.value)} placeholder="End Year" />
                  </div>
                  <button type="button" onClick={() => removeSectionItem('education', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className={sectionCardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Award className="h-5 w-5" /> Certifications</h2>
              <Button variant="secondary" className="rounded-2xl" onClick={() => addSectionItem('certifications')}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.certifications.map((item, index) => (
                <div key={`certification-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className={inputClass} value={item.name} onChange={(e) => updateSectionItem('certifications', index, 'name', e.target.value)} placeholder="Certification Name" />
                    <input className={inputClass} value={item.issuer} onChange={(e) => updateSectionItem('certifications', index, 'issuer', e.target.value)} placeholder="Issuing Organization" />
                    <input className={inputClass} value={item.issueDate} onChange={(e) => updateSectionItem('certifications', index, 'issueDate', e.target.value)} placeholder="Issue Date" />
                    <input className={inputClass} value={item.credentialId} onChange={(e) => updateSectionItem('certifications', index, 'credentialId', e.target.value)} placeholder="Credential ID" />
                  </div>
                  <input className={`${inputClass} mt-4`} value={item.link} onChange={(e) => updateSectionItem('certifications', index, 'link', e.target.value)} placeholder="Credential Link" />
                  <button type="button" onClick={() => removeSectionItem('certifications', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className={sectionCardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Briefcase className="h-5 w-5" /> Experience</h2>
              <Button variant="secondary" className="rounded-2xl" onClick={() => addSectionItem('experience')}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map((item, index) => (
                <div key={`experience-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className={inputClass} value={item.company} onChange={(e) => updateSectionItem('experience', index, 'company', e.target.value)} placeholder="Company" />
                    <input className={inputClass} value={item.position} onChange={(e) => updateSectionItem('experience', index, 'position', e.target.value)} placeholder="Position" />
                    <input className={inputClass} value={item.startDate} onChange={(e) => updateSectionItem('experience', index, 'startDate', e.target.value)} placeholder="Start Date" />
                    <input className={inputClass} value={item.endDate} onChange={(e) => updateSectionItem('experience', index, 'endDate', e.target.value)} placeholder="End Date" />
                  </div>
                  <textarea className={`${textareaClass} mt-4`} value={item.description} onChange={(e) => updateSectionItem('experience', index, 'description', e.target.value)} placeholder="Summarize ownership, impact, and measurable outcomes." />
                  <button type="button" onClick={() => removeSectionItem('experience', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className={sectionCardClass}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><FileText className="h-5 w-5" /> Projects</h2>
              <Button variant="secondary" className="rounded-2xl" onClick={() => addSectionItem('projects')}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map((item, index) => (
                <div key={`projects-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className={inputClass} value={item.title} onChange={(e) => updateSectionItem('projects', index, 'title', e.target.value)} placeholder="Project Title" />
                    <input className={inputClass} value={item.link} onChange={(e) => updateSectionItem('projects', index, 'link', e.target.value)} placeholder="Project Link" />
                  </div>
                  <input className={`${inputClass} mt-4`} value={item.technologies} onChange={(e) => updateSectionItem('projects', index, 'technologies', e.target.value)} placeholder="Technologies Used" />
                  <textarea className={`${textareaClass} mt-4`} value={item.description} onChange={(e) => updateSectionItem('projects', index, 'description', e.target.value)} placeholder="Describe the problem solved, approach, and result." />
                  <button type="button" onClick={() => removeSectionItem('projects', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <Card className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100/70 p-4 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.45)]">
            <div className="mb-4 flex items-center justify-between rounded-[24px] bg-white/80 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Live Preview</p>
                <h2 className="text-lg font-bold text-slate-900">Resume Canvas</h2>
              </div>
              <Badge className="border-0 bg-slate-900 text-white">{completionStats.completed}/{completionStats.total} complete</Badge>
            </div>
            <div ref={previewRef} className="overflow-hidden rounded-[28px]">
              <ResumePreview resume={resumeData} template={template} theme={theme} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedResumeBuilder;
