import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/index';
import Dashboard from './pages/dashboard';
import DocsSite from './pages/docs';
import OnboardingPage from './pages/onboarding';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs/:repoId" element={<DocsSite />} />
      <Route path="/onboarding/:repoId" element={<OnboardingPage />} />
    </Routes>
  );
}

export default App;
