import { lazy, Suspense } from 'react';
import Loader from './Loader';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const LazyEditor = (props) => {
  return (
    <Suspense fallback={<Loader label="Loading editor..." className="h-full min-h-[320px]" />}>
      <MonacoEditor {...props} />
    </Suspense>
  );
};

export default LazyEditor;
