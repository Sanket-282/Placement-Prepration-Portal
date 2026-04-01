import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { resumeAPI } from '../services/api';
import {
  RESUME_STEPS,
  buildResumeFileName,
  calculateResumeInsights,
  createDefaultResume,
  createEmptyCertification,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
  normalizeResumeResponse
} from '../components/resume/resumeBuilderConfig';

const ResumeBuilderContext = createContext(null);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ARRAY_FACTORIES = {
  education: createEmptyEducation,
  projects: createEmptyProject,
  experience: createEmptyExperience,
  certifications: createEmptyCertification
};

const clearMatchingErrors = (errors, pathPrefix) =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith(pathPrefix)));

const setValueAtPath = (source, path, value) => {
  const segments = Array.isArray(path) ? path : `${path}`.split('.');
  const cloned = Array.isArray(source) ? [...source] : { ...source };
  let cursor = cloned;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;

    if (isLast) {
      cursor[segment] = value;
      return;
    }

    const nextValue = cursor[segment];
    cursor[segment] = Array.isArray(nextValue) ? [...nextValue] : { ...nextValue };
    cursor = cursor[segment];
  });

  return cloned;
};

const createSavePayload = (resume) => ({
  personalInfo: resume.personalInfo,
  targetRole: resume.targetRole,
  summary: resume.summary,
  education: resume.education,
  skills: resume.skills,
  projects: resume.projects,
  experience: resume.experience,
  certifications: resume.certifications,
  achievements: resume.achievements,
  extracurricular: resume.extracurricular,
  languages: resume.languages,
  template: resume.template,
  theme: resume.theme
});

const validateResumeStep = (resume, stepIndex) => {
  const stepId = RESUME_STEPS[stepIndex]?.id;
  const errors = {};

  if (stepId === 'personal') {
    if (!resume.personalInfo.fullName.trim()) errors['personalInfo.fullName'] = 'Full name is required.';
    if (!resume.personalInfo.email.trim()) errors['personalInfo.email'] = 'Email is required.';
    if (resume.personalInfo.email.trim() && !EMAIL_REGEX.test(resume.personalInfo.email)) errors['personalInfo.email'] = 'Enter a valid email address.';
    if (!resume.personalInfo.phone.trim()) errors['personalInfo.phone'] = 'Phone number is required.';
  }

  if (stepId === 'summary') {
    if (!resume.targetRole.trim()) errors.targetRole = 'Target role is required.';
    if (resume.summary.trim().length < 40) errors.summary = 'Summary should be at least 40 characters.';
  }

  if (stepId === 'education') {
    resume.education.forEach((item, index) => {
      const hasAnyValue = Object.values(item).some((value) => `${value || ''}`.trim());
      if (!hasAnyValue) return;
      if (!item.degree.trim()) errors[`education.${index}.degree`] = 'Degree is required.';
      if (!item.college.trim()) errors[`education.${index}.college`] = 'College is required.';
      if (!item.year.trim()) errors[`education.${index}.year`] = 'Year is required.';
    });
  }

  if (stepId === 'projects') {
    resume.projects.forEach((item, index) => {
      const hasAnyValue = item.title || item.description || item.techStack.length > 0 || item.githubLink || item.liveLink;
      if (!hasAnyValue) return;
      if (!item.title.trim()) errors[`projects.${index}.title`] = 'Project title is required.';
      if (!item.description.trim()) errors[`projects.${index}.description`] = 'Project description is required.';
    });
  }

  if (stepId === 'experience') {
    resume.experience.forEach((item, index) => {
      const hasAnyValue = Object.values(item).some((value) => `${value || ''}`.trim());
      if (!hasAnyValue) return;
      if (!item.company.trim()) errors[`experience.${index}.company`] = 'Company is required.';
      if (!item.role.trim()) errors[`experience.${index}.role`] = 'Role is required.';
    });
  }

  if (stepId === 'certifications') {
    resume.certifications.forEach((item, index) => {
      const hasAnyValue = Object.values(item).some((value) => `${value || ''}`.trim());
      if (!hasAnyValue) return;
      if (!item.name.trim()) errors[`certifications.${index}.name`] = 'Certification name is required.';
      if (!item.issuer.trim()) errors[`certifications.${index}.issuer`] = 'Issuer is required.';
    });
  }

  return errors;
};

export const ResumeBuilderProvider = ({ children }) => {
  const { user } = useAuth();
  const [resume, setResume] = useState(() => createDefaultResume(user));
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [resumeInsights, setResumeInsights] = useState(() => calculateResumeInsights(createDefaultResume(user)));
  const saveTimerRef = useRef(null);
  const lastSnapshotRef = useRef('');
  const readyRef = useRef(false);

  useEffect(() => {
    const loadResume = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setSaveError('');

      try {
        const response = await resumeAPI.getByUserId(user.id);
        const normalizedResume = normalizeResumeResponse(response.data.resume, user);
        setResume(normalizedResume);
        setResumeInsights(response.data.insights || calculateResumeInsights(normalizedResume));
        lastSnapshotRef.current = JSON.stringify(createSavePayload(normalizedResume));
        setLastSavedAt(response.data.resume.updatedAt || null);
      } catch (error) {
        const localDraft = createDefaultResume(user);
        setResume(localDraft);
        setResumeInsights(calculateResumeInsights(localDraft));
        lastSnapshotRef.current = JSON.stringify(createSavePayload(localDraft));

        if (error.response?.status !== 404) {
          setSaveError(error.response?.data?.message || 'Unable to load your resume draft.');
        }
      } finally {
        readyRef.current = true;
        setLoading(false);
      }
    };

    loadResume();

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    setResumeInsights(calculateResumeInsights(resume));
  }, [resume]);

  const persistResume = async (draft, source = 'autosave') => {
    try {
      setSaveState('saving');
      setSaveError('');

      const response = await resumeAPI.upsert(createSavePayload(draft));
      const normalizedResume = normalizeResumeResponse(response.data.resume, user);
      const snapshot = JSON.stringify(createSavePayload(normalizedResume));

      lastSnapshotRef.current = snapshot;
      setResume((current) => ({
        ...current,
        _id: normalizedResume._id,
        updatedAt: normalizedResume.updatedAt,
        template: normalizedResume.template,
        theme: normalizedResume.theme
      }));
      setResumeInsights(response.data.insights || calculateResumeInsights(normalizedResume));
      setLastSavedAt(normalizedResume.updatedAt || new Date().toISOString());
      setSaveState(source === 'autosave' ? 'saved' : 'idle');
    } catch (error) {
      setSaveState('error');
      setSaveError(error.response?.data?.message || 'Autosave failed. Your draft is still safe locally.');
    }
  };

  useEffect(() => {
    if (!readyRef.current) {
      return undefined;
    }

    const snapshot = JSON.stringify(createSavePayload(resume));

    if (snapshot === lastSnapshotRef.current) {
      return undefined;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      persistResume(resume, 'autosave');
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [resume]);

  const updateField = (path, value) => {
    setResume((current) => setValueAtPath(current, path, value));
    setFieldErrors((current) => clearMatchingErrors(current, Array.isArray(path) ? path.join('.') : path));
  };

  const updateArrayItem = (section, index, field, value) => {
    setResume((current) => {
      const updatedItems = [...current[section]];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...current, [section]: updatedItems };
    });
    setFieldErrors((current) => clearMatchingErrors(current, `${section}.${index}.${field}`));
  };

  const addArrayItem = (section) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], ARRAY_FACTORIES[section]()]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResume((current) => {
      const filteredItems = current[section].filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        [section]: filteredItems.length > 0 ? filteredItems : [ARRAY_FACTORIES[section]()]
      };
    });
    setFieldErrors((current) => clearMatchingErrors(current, `${section}.${index}`));
  };

  const addListItem = (path, value) => {
    const nextValue = `${value || ''}`.trim();
    if (!nextValue) return;

    const segments = Array.isArray(path) ? path : `${path}`.split('.');
    setResume((current) => {
      const existingItems = segments.reduce((acc, segment) => acc[segment], current);
      return setValueAtPath(current, segments, [...existingItems, nextValue]);
    });
  };

  const removeListItem = (path, index) => {
    const segments = Array.isArray(path) ? path : `${path}`.split('.');
    setResume((current) => {
      const existingItems = segments.reduce((acc, segment) => acc[segment], current);
      return setValueAtPath(current, segments, existingItems.filter((_, itemIndex) => itemIndex !== index));
    });
  };

  const validateCurrentStep = (stepIndex = currentStep) => {
    const errors = validateResumeStep(resume, stepIndex);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep = (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= RESUME_STEPS.length) return;
    setCurrentStep(stepIndex);
  };

  const goNext = () => {
    const isValid = validateCurrentStep();
    if (!isValid) return false;
    setCurrentStep((current) => Math.min(current + 1, RESUME_STEPS.length - 1));
    return true;
  };

  const goPrevious = () => {
    setCurrentStep((current) => Math.max(current - 1, 0));
  };

  const saveNow = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    await persistResume(resume, 'manual');
  };

  const downloadResume = async (previewElement) => {
    if (!previewElement) {
      setSaveError('Resume preview is not available for download.');
      return;
    }

    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    const exportHost = document.createElement('div');
    exportHost.style.position = 'fixed';
    exportHost.style.left = '-10000px';
    exportHost.style.top = '0';
    exportHost.style.width = '794px';
    exportHost.style.background = '#ffffff';
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

    try {
      await html2pdf()
        .set({
          filename: buildResumeFileName(resume.personalInfo.fullName),
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
    } finally {
      exportHost.remove();
    }
  };

  return (
    <ResumeBuilderContext.Provider
      value={{
        resume,
        currentStep,
        loading,
        saveState,
        saveError,
        lastSavedAt,
        fieldErrors,
        resumeInsights,
        updateField,
        updateArrayItem,
        addArrayItem,
        removeArrayItem,
        addListItem,
        removeListItem,
        goToStep,
        goNext,
        goPrevious,
        saveNow,
        downloadResume,
        validateCurrentStep,
        setCurrentStep
      }}
    >
      {children}
    </ResumeBuilderContext.Provider>
  );
};

export const useResumeBuilder = () => {
  const context = useContext(ResumeBuilderContext);
  if (!context) {
    throw new Error('useResumeBuilder must be used within a ResumeBuilderProvider');
  }
  return context;
};
