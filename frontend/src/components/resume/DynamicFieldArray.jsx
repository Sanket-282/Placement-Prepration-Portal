import Button from '../ui/Button';

const DynamicFieldArray = ({ title, icon, description, onAdd, children, actionLabel = 'Add Item' }) => {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>
        <Button variant="secondary" className="rounded-2xl" onClick={onAdd}>
          {actionLabel}
        </Button>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default DynamicFieldArray;
