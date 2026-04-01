import { Download, Loader2, Sparkles, Target } from 'lucide-react';
import { useRef, useState } from 'react';
import { useResumeBuilder } from '../../context/ResumeBuilderContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { getTemplateTheme } from './resumeBuilderConfig';

const getHeroStyle = (template, theme, isDark) => {
  if (template.hero === 'boxed') {
    return {
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
        : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.18)'}`
    };
  }

  if (template.hero === 'centered') {
    return {
      background: isDark
        ? `radial-gradient(circle at top, rgba(255,255,255,0.08), ${theme.ink} 68%)`
        : `linear-gradient(180deg, ${theme.soft}, #ffffff)`
    };
  }

  if (template.hero === 'minimal') {
    return {
      background: isDark ? '#020617' : '#ffffff',
      borderTop: `5px solid ${theme.accent}`
    };
  }

  if (template.hero === 'stripe') {
    return {
      background: isDark ? '#0f172a' : '#ffffff',
      borderLeft: `6px solid ${theme.accent}`
    };
  }

  return {
    background: isDark
      ? `linear-gradient(135deg, ${theme.ink} 0%, #0f172a 55%, #020617 100%)`
      : `linear-gradient(135deg, ${theme.soft} 0%, #ffffff 72%)`,
    borderBottom: `4px solid ${theme.accent}`
  };
};

const getHeroInnerClass = (template) => {
  if (template.hero === 'centered') return 'text-center';
  if (template.layout === 'stacked') return 'grid gap-5';
  if (template.hero === 'boxed') return 'grid gap-5 lg:grid-cols-[1.05fr_0.95fr]';
  if (template.hero === 'stripe') return 'grid gap-6 lg:grid-cols-[1.1fr_0.9fr]';
  return 'grid gap-6 lg:grid-cols-[1.2fr_0.9fr]';
};

const getSectionTitleClass = (template, isDark) => {
  if (template.sectionStyle === 'block') {
    return `mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white'}`;
  }

  if (template.sectionStyle === 'pill') {
    return 'mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em]';
  }

  return `${isDark ? 'text-slate-300 border-white/10' : 'text-slate-500 border-slate-200'} mb-4 border-b pb-2 text-xs font-bold uppercase tracking-[0.25em]`;
};

const PreviewPanel = () => {
  const { resume, resumeInsights, downloadResume } = useResumeBuilder();
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);
  const filledEducation = resume.education.filter((item) => item.degree || item.college);
  const filledProjects = resume.projects.filter((item) => item.title || item.description);
  const filledExperience = resume.experience.filter((item) => item.company || item.role);
  const filledCertifications = resume.certifications.filter((item) => item.name || item.issuer);
  const visual = getTemplateTheme(resume.template, resume.theme);
  const heroStyle = getHeroStyle(visual.template, visual.theme, visual.isDark);
  const heroInnerClass = getHeroInnerClass(visual.template);
  const sectionTitleClass = getSectionTitleClass(visual.template, visual.isDark);
  const pillSectionStyle = visual.template.sectionStyle === 'pill' ? { backgroundColor: visual.theme.soft, color: visual.theme.ink } : undefined;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResume(previewRef.current);
    } catch (error) {
      window.alert('Unable to export the resume right now. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="xl:sticky xl:top-24 xl:self-start">
      <Card className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100/70 p-4 shadow-[0_25px_65px_-45px_rgba(15,23,42,0.45)]">
        <div className="mb-4 grid gap-4 rounded-[24px] bg-white/85 px-4 py-4 sm:px-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold text-slate-500">Live Preview</p>
            <h2 className="text-lg font-bold text-slate-900">ATS-Friendly Resume Canvas</h2>
            <p className="mt-1 text-sm text-slate-500">Every change updates instantly and exports in the selected template style.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-2xl bg-slate-900 px-4 py-3 text-white sm:px-5 sm:py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300 sm:text-xs sm:tracking-[0.22em]">Completion</p>
              <p className="mt-1 text-2xl font-black sm:text-[28px]">{resumeInsights.completionScore}%</p>
            </div>
            <div className="min-w-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 px-4 py-3 text-white sm:px-5 sm:py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100 sm:text-xs sm:tracking-[0.22em]">ATS Score</p>
              <p className="mt-1 text-2xl font-black sm:text-[28px]">{resumeInsights.atsScore}</p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-[24px] border border-slate-200 bg-white/90 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <Target className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">ATS Guidance</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeInsights.matchedKeywords.length > 0 ? (
              resumeInsights.matchedKeywords.map((keyword) => (
                <Badge key={keyword} className="border-0 bg-emerald-100 text-emerald-700">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">Add a target role to surface matching keywords here.</p>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {resumeInsights.suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion} className="flex gap-2 text-sm text-slate-600">
                <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <Button className="rounded-2xl border-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-95" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>

        <div ref={previewRef} className="overflow-hidden rounded-[28px]">
          <div className={`min-h-[960px] rounded-[28px] p-8 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.45)] ${visual.surfaceClass} ${visual.fontClass}`}>
            <div className="rounded-[24px] p-8" style={heroStyle}>
              <div className={heroInnerClass}>
                <div className={visual.template.hero === 'centered' ? 'text-center' : ''}>
                  <h1 className={`text-4xl font-black ${visual.primaryTextClass}`}>
                    {resume.personalInfo.fullName || 'Your Name'}
                  </h1>
                  <p className={`mt-3 text-sm ${visual.secondaryTextClass}`}>
                    {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location].filter(Boolean).join(' | ') || 'email@example.com | +91 98765 43210 | Pune, India'}
                  </p>
                  <p className={`mt-2 text-sm ${visual.tertiaryTextClass}`}>
                    {[resume.personalInfo.linkedin, resume.personalInfo.github, resume.personalInfo.portfolio].filter(Boolean).join(' | ') || 'LinkedIn | GitHub | Portfolio'}
                  </p>
                  {resume.targetRole ? (
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: visual.theme.accent }}>
                      {resume.targetRole}
                    </p>
                  ) : null}
                </div>
                <div className={`rounded-[22px] border p-5 ${visual.isDark ? 'border-white/10 bg-white/5' : 'border-white bg-white/80'}`}>
                  <p className={`text-sm leading-7 ${visual.secondaryTextClass}`}>
                    {resume.summary || 'Write a concise career summary that explains your target role, strengths, and measurable impact.'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`mt-8 grid gap-8 ${visual.contentGridClass}`}>
              <div>
                <h3 className={sectionTitleClass} style={pillSectionStyle}>Skills</h3>
                <div className="space-y-4">
                  <div>
                    <p className={`mb-2 text-sm font-semibold ${visual.secondaryTextClass}`}>Technical</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.technical.length > 0 ? resume.skills.technical.map((item, index) => (
                        <span key={`technical-${item}-${index}`} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: visual.template.sectionStyle === 'pill' ? visual.theme.accent : visual.theme.soft, color: visual.template.sectionStyle === 'pill' ? '#ffffff' : visual.theme.ink }}>
                          {item}
                        </span>
                      )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add technical skills here.</p>}
                    </div>
                  </div>
                  <div>
                    <p className={`mb-2 text-sm font-semibold ${visual.secondaryTextClass}`}>Soft</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.soft.length > 0 ? resume.skills.soft.map((item, index) => (
                        <span key={`soft-${item}-${index}`} className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: visual.theme.soft, color: visual.theme.ink }}>
                          {item}
                        </span>
                      )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add soft skills here.</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className={sectionTitleClass} style={pillSectionStyle}>Education</h3>
                  <div className="space-y-4">
                    {filledEducation.length > 0 ? filledEducation.map((item, index) => (
                      <div key={`${item.college}-${index}`} className={visual.cardClass}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`font-bold ${visual.primaryTextClass}`}>{item.degree || 'Degree'}</p>
                            <p className={`mt-1 text-sm ${visual.secondaryTextClass}`}>{item.college || 'College / Institution'}</p>
                          </div>
                          <p className={`text-sm font-semibold ${visual.tertiaryTextClass}`}>{item.year || 'Year'}</p>
                        </div>
                        {item.cgpa ? <p className={`mt-2 text-sm ${visual.tertiaryTextClass}`}>CGPA / Score: {item.cgpa}</p> : null}
                      </div>
                    )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add your academic history to populate this section.</p>}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className={sectionTitleClass} style={pillSectionStyle}>Certifications</h3>
                  <div className="space-y-4">
                    {filledCertifications.length > 0 ? filledCertifications.map((item, index) => (
                      <div key={`${item.name}-${index}`} className={visual.cardClass}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`font-bold ${visual.primaryTextClass}`}>{item.name || 'Certification'}</p>
                            <p className={`mt-1 text-sm ${visual.secondaryTextClass}`}>{item.issuer || 'Issuer'}</p>
                          </div>
                          <p className={`text-sm font-semibold ${visual.tertiaryTextClass}`}>{item.year || 'Year'}</p>
                        </div>
                        {item.credentialId ? <p className={`mt-2 text-sm ${visual.tertiaryTextClass}`}>Credential ID: {item.credentialId}</p> : null}
                      </div>
                    )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add licenses, certificates, and workshops here.</p>}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className={sectionTitleClass} style={pillSectionStyle}>Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.languages.length > 0 ? resume.languages.map((language, index) => (
                      <span key={`${language}-${index}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        {language}
                      </span>
                    )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add languages you can work with.</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className={sectionTitleClass} style={pillSectionStyle}>Experience</h3>
                <div className="space-y-4">
                  {filledExperience.length > 0 ? filledExperience.map((item, index) => (
                    <div key={`${item.company}-${index}`} className={visual.cardClass}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-bold ${visual.primaryTextClass}`}>{item.role || 'Role'}</p>
                          <p className={`mt-1 text-sm ${visual.secondaryTextClass}`}>{item.company || 'Company'}</p>
                        </div>
                        <p className={`text-sm font-semibold ${visual.tertiaryTextClass}`}>{item.duration || 'Duration'}</p>
                      </div>
                      {item.description ? <p className={`mt-3 text-sm leading-7 ${visual.secondaryTextClass}`}>{item.description}</p> : null}
                    </div>
                  )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add internships, jobs, and practical experience.</p>}
                </div>

                <div className="mt-8">
                  <h3 className={sectionTitleClass} style={pillSectionStyle}>Projects</h3>
                  <div className="space-y-4">
                    {filledProjects.length > 0 ? filledProjects.map((item, index) => (
                      <div key={`${item.title}-${index}`} className={visual.cardClass}>
                        <div className="flex items-start justify-between gap-4">
                          <p className={`font-bold ${visual.primaryTextClass}`}>{item.title || 'Project'}</p>
                          <div className="flex flex-wrap justify-end gap-2 text-xs font-semibold">
                            {item.githubLink ? <a href={item.githubLink} target="_blank" rel="noreferrer" style={{ color: visual.theme.accent }}>GitHub</a> : null}
                            {item.liveLink ? <a href={item.liveLink} target="_blank" rel="noreferrer" style={{ color: visual.theme.accent }}>Live</a> : null}
                          </div>
                        </div>
                        {item.techStack.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.techStack.map((tech, techIndex) => (
                              <span key={`${item.title}-${tech}-${techIndex}`} className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: visual.theme.soft, color: visual.theme.ink }}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {item.description ? <p className={`mt-3 text-sm leading-7 ${visual.secondaryTextClass}`}>{item.description}</p> : null}
                      </div>
                    )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add projects with stack and outcomes for recruiter clarity.</p>}
                  </div>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className={sectionTitleClass} style={pillSectionStyle}>Achievements</h3>
                    <div className="space-y-2">
                      {resume.achievements.length > 0 ? resume.achievements.map((item, index) => (
                        <div key={`${item}-${index}`} className={`text-sm leading-6 ${visual.secondaryTextClass}`}>- {item}</div>
                      )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add awards, rankings, and measurable wins.</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className={sectionTitleClass} style={pillSectionStyle}>Activities</h3>
                    <div className="space-y-2">
                      {resume.extracurricular.length > 0 ? resume.extracurricular.map((item, index) => (
                        <div key={`${item}-${index}`} className={`text-sm leading-6 ${visual.secondaryTextClass}`}>- {item}</div>
                      )) : <p className={`text-sm ${visual.tertiaryTextClass}`}>Add leadership, volunteering, and club work.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PreviewPanel;
