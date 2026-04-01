import { Check } from 'lucide-react';
import { RESUME_STEPS } from './resumeBuilderConfig';

const ResumeStepper = ({ currentStep, onStepChange }) => {
  const progress = ((currentStep + 1) / RESUME_STEPS.length) * 100;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">Resume Progress</p>
          <h2 className="text-xl font-bold text-slate-900">{RESUME_STEPS[currentStep].title}</h2>
        </div>
        <div className="w-fit rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
          {currentStep + 1}/{RESUME_STEPS.length}
        </div>
      </div>

      <div className="progress-bar mb-5">
        <div className="progress-bar-fill bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {RESUME_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={`h-full w-full rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                  : isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]">
                  {step.shortLabel}
                </span>
              </div>
              <p className={`text-xs leading-5 break-words ${isActive ? 'text-slate-300' : isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                {step.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeStepper;
