import { Loader2 } from 'lucide-react';

const Loader = ({ label = 'Loading...', className = 'h-64' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
};

export default Loader;
