import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import LandingPage from './pages/index';
import Dashboard from './pages/dashboard';
import DocsSite from './pages/docs';
import Onboarding from './pages/onboarding';
import SelectRepo from './pages/selectRepo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/:repoId" element={<Dashboard />} />
      <Route path="/docs/:repoId" element={<DocsSite />} />
      <Route path="/onboarding/:repoId" element={<Onboarding />} />
      <Route path="/selectrepo" element={<SelectRepo />} />
    </Routes>
  );
}


export default App;
