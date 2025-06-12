import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import LandingPage from './pages/index';
import Dashboard from './pages/dashboard';
import DocsArchitecture from './pages/docs';
import Onboarding from './pages/onboarding';
import SelectRepo from './pages/selectRepo';
import Hotspots from './pages/hotspots';
import RecentChanges from './pages/commitHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/:repoId" element={<Dashboard />} />
      <Route path="/docs/:repoId" element={<DocsArchitecture />} />
      <Route path="/onboarding/:repoId" element={<Onboarding />} />
      <Route path="/hotspots/:repoId" element={<Hotspots />} />
      <Route path="/commits/:repoId" element={<RecentChanges />} />
      <Route path="/selectrepo" element={<SelectRepo />} />
    </Routes>
  );
}


export default App;
