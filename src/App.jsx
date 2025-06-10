import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import LandingPage from './pages/index';
import Dashboard from './pages/dashboard';
import DocsSite from './pages/docs';
import Onboarding from './pages/onboarding';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs/:repoId" element={<DocsSite />} />
      <Route path="/onboarding/:repoId" element={<OnboardingWrapper />} />
    </Routes>
  );
}

function OnboardingWrapper() {
  const { repoId } = useParams();
  const { state } = useLocation();
  const userId = state?.userId;
  if (!userId) return <div>Missing user ID</div>;
  return <Onboarding userId={userId} repoId={repoId} />;
}

export default App;
