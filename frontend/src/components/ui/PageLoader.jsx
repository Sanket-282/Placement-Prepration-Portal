import Loader from './Loader';

const PageLoader = ({ label = 'Loading your workspace...' }) => {
  return <Loader label={label} className="min-h-screen" />;
};

export default PageLoader;
