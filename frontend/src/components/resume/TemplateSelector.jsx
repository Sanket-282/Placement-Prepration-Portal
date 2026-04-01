import { LayoutTemplate, Palette } from 'lucide-react';
import { useResumeBuilder } from '../../context/ResumeBuilderContext';
import { RESUME_TEMPLATES, RESUME_THEMES } from './resumeBuilderConfig';

const TemplateSelector = () => {
  const { resume, updateField } = useResumeBuilder();

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-slate-900 p-3 text-white">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Template Studio</h3>
          <p className="text-sm text-slate-500">Switch layouts and color palettes without reloading the preview.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {RESUME_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => updateField('template', template.id)}
            className={`rounded-[24px] border p-5 text-left transition ${
              resume.template === template.id
                ? 'border-slate-900 bg-slate-900 text-white shadow-xl'
                : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <p className="text-sm font-black">{template.name}</p>
            <p className={`mt-2 text-sm leading-6 ${resume.template === template.id ? 'text-slate-300' : 'text-slate-500'}`}>{template.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Theme Accent</h4>
          <p className="text-sm text-slate-500">Choose a visual direction for the selected template.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {RESUME_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => updateField('theme', theme.id)}
            className={`rounded-[22px] border p-4 text-left transition ${
              resume.theme === theme.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="mb-3 flex gap-2">
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: theme.accent }} />
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: theme.soft }} />
            </div>
            <p className="text-sm font-bold">{theme.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
