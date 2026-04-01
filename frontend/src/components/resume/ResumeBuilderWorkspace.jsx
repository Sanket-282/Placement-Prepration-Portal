import { Loader2 } from 'lucide-react';
import { ResumeBuilderProvider, useResumeBuilder } from '../../context/ResumeBuilderContext';
import ResumeFormSections from './ResumeFormSections';
import ResumeStepper from './ResumeStepper';
import PreviewPanel from './PreviewPanel';
import TemplateSelector from './TemplateSelector';

const WorkspaceContent = () => {
  const { currentStep, goToStep, loading, saveError } = useResumeBuilder();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 px-8 py-10 text-center shadow-[0_25px_70px_-40px_rgba(15,23,42,0.45)]">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-900" />
          <p className="mt-4 text-base font-semibold text-slate-700">Loading your resume workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {saveError ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-[0_15px_45px_-35px_rgba(220,38,38,0.35)]">
          {saveError}
        </div>
      ) : null}

      <ResumeStepper currentStep={currentStep} onStepChange={goToStep} />

      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <TemplateSelector />
          <ResumeFormSections />
        </div>
        <PreviewPanel />
      </div>
    </div>
  );
};

const ResumeBuilderWorkspace = () => {
  return (
    <ResumeBuilderProvider>
      <WorkspaceContent />
    </ResumeBuilderProvider>
  );
};

export default ResumeBuilderWorkspace;
