import { useState } from 'react';
import {
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  Lightbulb,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy
} from 'lucide-react';
import { useResumeBuilder } from '../../context/ResumeBuilderContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import DynamicFieldArray from './DynamicFieldArray';
import { getRoleKeywordSuggestions } from './resumeBuilderConfig';

const getInputClass = (hasError) =>
  `form-input ${hasError ? 'border-red-300 bg-red-50/40 focus:border-red-400' : ''}`;

const ErrorText = ({ message }) => (message ? <p className="form-error">{message}</p> : null);

const ChipComposer = ({ label, placeholder, value, onChange, onSubmit, items, onRemove, chipTone = 'bg-slate-100 text-slate-700' }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="flex gap-2">
        <input className={getInputClass(false)} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} />
        <Button className="rounded-2xl" onClick={onSubmit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item, index) => (
          <span key={`${item}-${index}`} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${chipTone}`}>
            {item}
            <button type="button" onClick={() => onRemove(index)} className="text-current/60 hover:text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        )) : <p className="text-sm text-slate-500">No items added yet.</p>}
      </div>
    </div>
  );
};

const StringListStep = ({ title, description, label, placeholder, draftValue, onDraftChange, onSubmit, items, onRemove }) => (
  <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    <div className="mt-5">
      <ChipComposer
        label={label}
        placeholder={placeholder}
        value={draftValue}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        items={items}
        onRemove={onRemove}
      />
    </div>
  </div>
);

const ResumeFormSections = () => {
  const {
    resume,
    currentStep,
    fieldErrors,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    addListItem,
    removeListItem,
    goNext,
    goPrevious,
    saveNow,
    saveState,
    lastSavedAt
  } = useResumeBuilder();

  const [drafts, setDrafts] = useState({
    technical: '',
    soft: '',
    achievements: '',
    extracurricular: '',
    languages: ''
  });
  const [projectTechDrafts, setProjectTechDrafts] = useState({});
  const keywordSuggestions = getRoleKeywordSuggestions(resume.targetRole);

  const setDraftValue = (key, value) => {
    setDrafts((current) => ({ ...current, [key]: value }));
  };

  const addChipValue = (path, draftKey) => {
    addListItem(path, drafts[draftKey]);
    setDraftValue(draftKey, '');
  };

  const addProjectTech = (projectIndex) => {
    addListItem(['projects', projectIndex, 'techStack'], projectTechDrafts[projectIndex] || '');
    setProjectTechDrafts((current) => ({ ...current, [projectIndex]: '' }));
  };

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
          <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
          <p className="mt-1 text-sm text-slate-500">Add recruiter-visible contact details and professional links.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Full Name</label>
              <input className={getInputClass(fieldErrors['personalInfo.fullName'])} value={resume.personalInfo.fullName} onChange={(event) => updateField('personalInfo.fullName', event.target.value)} placeholder="Tejas Subhash Thigale" />
              <ErrorText message={fieldErrors['personalInfo.fullName']} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className={getInputClass(fieldErrors['personalInfo.email'])} value={resume.personalInfo.email} onChange={(event) => updateField('personalInfo.email', event.target.value)} placeholder="email@example.com" />
              <ErrorText message={fieldErrors['personalInfo.email']} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className={getInputClass(fieldErrors['personalInfo.phone'])} value={resume.personalInfo.phone} onChange={(event) => updateField('personalInfo.phone', event.target.value)} placeholder="+91 98765 43210" />
              <ErrorText message={fieldErrors['personalInfo.phone']} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className={getInputClass(false)} value={resume.personalInfo.location} onChange={(event) => updateField('personalInfo.location', event.target.value)} placeholder="Pune, Maharashtra" />
            </div>
            <div>
              <label className="form-label">LinkedIn</label>
              <input className={getInputClass(false)} value={resume.personalInfo.linkedin} onChange={(event) => updateField('personalInfo.linkedin', event.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="form-label">GitHub</label>
              <input className={getInputClass(false)} value={resume.personalInfo.github} onChange={(event) => updateField('personalInfo.github', event.target.value)} placeholder="https://github.com/username" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Portfolio</label>
              <input className={getInputClass(false)} value={resume.personalInfo.portfolio} onChange={(event) => updateField('personalInfo.portfolio', event.target.value)} placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
          <h3 className="text-xl font-bold text-slate-900">Career Summary</h3>
          <p className="mt-1 text-sm text-slate-500">Define your target role and write a concise, ATS-aware professional summary.</p>
          <div className="mt-5 grid gap-4">
            <div>
              <label className="form-label">Target Role</label>
              <input className={getInputClass(fieldErrors.targetRole)} value={resume.targetRole} onChange={(event) => updateField('targetRole', event.target.value)} placeholder="Software Engineer" />
              <ErrorText message={fieldErrors.targetRole} />
            </div>
            <div>
              <label className="form-label">Professional Summary</label>
              <textarea className={`${getInputClass(fieldErrors.summary)} min-h-[160px] resize-y`} value={resume.summary} onChange={(event) => updateField('summary', event.target.value)} placeholder="Write 3-5 lines focused on role, strengths, projects, and measurable impact." />
              <ErrorText message={fieldErrors.summary} />
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Suggested Keywords</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywordSuggestions.length > 0 ? keywordSuggestions.map((keyword) => (
                <Badge key={keyword} className="border-0 bg-indigo-100 text-indigo-700">
                  {keyword}
                </Badge>
              )) : <p className="text-sm text-slate-500">Add a target role to see ATS keyword suggestions.</p>}
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <DynamicFieldArray title="Education" description="Add academic milestones, college details, and scores." icon={<GraduationCap className="h-5 w-5" />} onAdd={() => addArrayItem('education')} actionLabel="Add Education">
          {resume.education.map((item, index) => (
            <div key={`education-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Degree</label>
                  <input className={getInputClass(fieldErrors[`education.${index}.degree`])} value={item.degree} onChange={(event) => updateArrayItem('education', index, 'degree', event.target.value)} placeholder="B.E. Computer Engineering" />
                  <ErrorText message={fieldErrors[`education.${index}.degree`]} />
                </div>
                <div>
                  <label className="form-label">College</label>
                  <input className={getInputClass(fieldErrors[`education.${index}.college`])} value={item.college} onChange={(event) => updateArrayItem('education', index, 'college', event.target.value)} placeholder="MIT ACSC, Pune" />
                  <ErrorText message={fieldErrors[`education.${index}.college`]} />
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input className={getInputClass(fieldErrors[`education.${index}.year`])} value={item.year} onChange={(event) => updateArrayItem('education', index, 'year', event.target.value)} placeholder="2021 - 2025" />
                  <ErrorText message={fieldErrors[`education.${index}.year`]} />
                </div>
                <div>
                  <label className="form-label">CGPA / Score</label>
                  <input className={getInputClass(false)} value={item.cgpa} onChange={(event) => updateArrayItem('education', index, 'cgpa', event.target.value)} placeholder="8.7 CGPA" />
                </div>
              </div>
              <button type="button" onClick={() => removeArrayItem('education', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </DynamicFieldArray>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
          <h3 className="text-xl font-bold text-slate-900">Skills</h3>
          <p className="mt-1 text-sm text-slate-500">Separate technical and soft skills for stronger ATS parsing.</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <ChipComposer label="Technical Skills" placeholder="React, Node.js, MongoDB..." value={drafts.technical} onChange={(value) => setDraftValue('technical', value)} onSubmit={() => addChipValue(['skills', 'technical'], 'technical')} items={resume.skills.technical} onRemove={(index) => removeListItem(['skills', 'technical'], index)} chipTone="bg-cyan-50 text-cyan-700" />
            <ChipComposer label="Soft Skills" placeholder="Communication, Leadership..." value={drafts.soft} onChange={(value) => setDraftValue('soft', value)} onSubmit={() => addChipValue(['skills', 'soft'], 'soft')} items={resume.skills.soft} onRemove={(index) => removeListItem(['skills', 'soft'], index)} chipTone="bg-indigo-50 text-indigo-700" />
          </div>
        </div>
      );
    }

    if (currentStep === 4) {
      return (
        <DynamicFieldArray title="Projects" description="Highlight outcomes, stack choices, and proof links." icon={<Lightbulb className="h-5 w-5" />} onAdd={() => addArrayItem('projects')} actionLabel="Add Project">
          {resume.projects.map((item, index) => (
            <div key={`project-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Project Title</label>
                  <input className={getInputClass(fieldErrors[`projects.${index}.title`])} value={item.title} onChange={(event) => updateArrayItem('projects', index, 'title', event.target.value)} placeholder="Placement Analytics Dashboard" />
                  <ErrorText message={fieldErrors[`projects.${index}.title`]} />
                </div>
                <div>
                  <label className="form-label">GitHub Link</label>
                  <input className={getInputClass(false)} value={item.githubLink} onChange={(event) => updateArrayItem('projects', index, 'githubLink', event.target.value)} placeholder="https://github.com/username/project" />
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label">Description</label>
                <textarea className={`${getInputClass(fieldErrors[`projects.${index}.description`])} min-h-[120px] resize-y`} value={item.description} onChange={(event) => updateArrayItem('projects', index, 'description', event.target.value)} placeholder="Describe the problem solved, your contribution, and measurable outcome." />
                <ErrorText message={fieldErrors[`projects.${index}.description`]} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <ChipComposer
                    label="Tech Stack"
                    placeholder="Add tech stack"
                    value={projectTechDrafts[index] || ''}
                    onChange={(value) => setProjectTechDrafts((current) => ({ ...current, [index]: value }))}
                    onSubmit={() => addProjectTech(index)}
                    items={item.techStack}
                    onRemove={(chipIndex) => removeListItem(['projects', index, 'techStack'], chipIndex)}
                    chipTone="bg-slate-100 text-slate-700"
                  />
                </div>
                <div>
                  <label className="form-label">Live Link</label>
                  <input className={getInputClass(false)} value={item.liveLink} onChange={(event) => updateArrayItem('projects', index, 'liveLink', event.target.value)} placeholder="https://project-demo.com" />
                </div>
              </div>
              <button type="button" onClick={() => removeArrayItem('projects', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </DynamicFieldArray>
      );
    }

    if (currentStep === 5) {
      return (
        <DynamicFieldArray title="Experience / Internships" description="Capture internships, jobs, and practical exposure." icon={<Briefcase className="h-5 w-5" />} onAdd={() => addArrayItem('experience')} actionLabel="Add Experience">
          {resume.experience.map((item, index) => (
            <div key={`experience-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Company</label>
                  <input className={getInputClass(fieldErrors[`experience.${index}.company`])} value={item.company} onChange={(event) => updateArrayItem('experience', index, 'company', event.target.value)} placeholder="OpenAI" />
                  <ErrorText message={fieldErrors[`experience.${index}.company`]} />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <input className={getInputClass(fieldErrors[`experience.${index}.role`])} value={item.role} onChange={(event) => updateArrayItem('experience', index, 'role', event.target.value)} placeholder="Software Engineering Intern" />
                  <ErrorText message={fieldErrors[`experience.${index}.role`]} />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Duration</label>
                  <input className={getInputClass(false)} value={item.duration} onChange={(event) => updateArrayItem('experience', index, 'duration', event.target.value)} placeholder="Jan 2025 - Mar 2025" />
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label">Description</label>
                <textarea className={`${getInputClass(false)} min-h-[120px] resize-y`} value={item.description} onChange={(event) => updateArrayItem('experience', index, 'description', event.target.value)} placeholder="Focus on ownership, impact, metrics, and tools used." />
              </div>
              <button type="button" onClick={() => removeArrayItem('experience', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </DynamicFieldArray>
      );
    }

    if (currentStep === 6) {
      return (
        <DynamicFieldArray title="Certifications" description="Add certificates, courses, and external credentials." icon={<Award className="h-5 w-5" />} onAdd={() => addArrayItem('certifications')} actionLabel="Add Certification">
          {resume.certifications.map((item, index) => (
            <div key={`certification-${index}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="form-label">Certification Name</label>
                  <input className={getInputClass(fieldErrors[`certifications.${index}.name`])} value={item.name} onChange={(event) => updateArrayItem('certifications', index, 'name', event.target.value)} placeholder="AWS Cloud Practitioner" />
                  <ErrorText message={fieldErrors[`certifications.${index}.name`]} />
                </div>
                <div>
                  <label className="form-label">Issuer</label>
                  <input className={getInputClass(fieldErrors[`certifications.${index}.issuer`])} value={item.issuer} onChange={(event) => updateArrayItem('certifications', index, 'issuer', event.target.value)} placeholder="Amazon Web Services" />
                  <ErrorText message={fieldErrors[`certifications.${index}.issuer`]} />
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input className={getInputClass(false)} value={item.year} onChange={(event) => updateArrayItem('certifications', index, 'year', event.target.value)} placeholder="2025" />
                </div>
                <div>
                  <label className="form-label">Credential ID</label>
                  <input className={getInputClass(false)} value={item.credentialId} onChange={(event) => updateArrayItem('certifications', index, 'credentialId', event.target.value)} placeholder="ABC-123-XYZ" />
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label">Credential Link</label>
                <input className={getInputClass(false)} value={item.link} onChange={(event) => updateArrayItem('certifications', index, 'link', event.target.value)} placeholder="https://credential-link.com" />
              </div>
              <button type="button" onClick={() => removeArrayItem('certifications', index)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          ))}
        </DynamicFieldArray>
      );
    }

    if (currentStep === 7) {
      return (
        <StringListStep
          title="Achievements"
          description="Add quantifiable wins, rankings, awards, or recognition."
          label="Achievements"
          placeholder="Solved 500+ DSA problems"
          draftValue={drafts.achievements}
          onDraftChange={(value) => setDraftValue('achievements', value)}
          onSubmit={() => addChipValue('achievements', 'achievements')}
          items={resume.achievements}
          onRemove={(index) => removeListItem('achievements', index)}
        />
      );
    }

    if (currentStep === 8) {
      return (
        <StringListStep
          title="Extra-Curricular Activities"
          description="Capture leadership, volunteering, hackathons, and community work."
          label="Activities"
          placeholder="Led coding club events for 200+ students"
          draftValue={drafts.extracurricular}
          onDraftChange={(value) => setDraftValue('extracurricular', value)}
          onSubmit={() => addChipValue('extracurricular', 'extracurricular')}
          items={resume.extracurricular}
          onRemove={(index) => removeListItem('extracurricular', index)}
        />
      );
    }

    if (currentStep === 9) {
      return (
        <StringListStep
          title="Languages"
          description="Mention languages you can speak, read, or work with professionally."
          label="Languages"
          placeholder="English"
          draftValue={drafts.languages}
          onDraftChange={(value) => setDraftValue('languages', value)}
          onSubmit={() => addChipValue('languages', 'languages')}
          items={resume.languages}
          onRemove={(index) => removeListItem('languages', index)}
        />
      );
    }

    return (
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Final Preview & Delivery</h3>
            <p className="text-sm text-slate-500">Review ATS hints, template styling, and export the final resume.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Auto Save Status</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {saveState === 'saving' ? 'Autosaving draft...' : saveState === 'error' ? 'Autosave needs attention' : 'Draft synced'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {lastSavedAt ? `Last saved at ${new Date(lastSavedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'No save timestamp yet.'}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Manual Sync</p>
            <p className="mt-2 text-sm text-slate-600">Use this when you want an immediate backend save before leaving the page.</p>
            <Button className="mt-4 rounded-2xl" onClick={saveNow}>
              <Save className="h-4 w-4" />
              Save Resume Now
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderStep()}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.45)]">
        <div className="text-sm text-slate-500">
          Steps can autosave as you type. Use Next to validate the current step before moving ahead.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-2xl" onClick={goPrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button className="rounded-2xl" onClick={goNext}>
            {currentStep === 10 ? 'Review Ready' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeFormSections;
