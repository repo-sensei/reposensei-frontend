import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Loader2, Paintbrush, Code, Sparkles  } from 'lucide-react';
import DashboardSidebar from '../components/common/DashboardSidebar';
import DetailedOverview from '../components/DetailedOverview';
import OnboardingTasks from '../components/OnboardingTasks';
import CriticalTasksAccordion from '../components/CriticalTasksAccordion';
import {
  SiReact,
  SiTailwindcss,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
} from 'react-icons/si';

import axios from 'axios';

function Onboarding() {
   const { repoId } = useParams(); 

  const [step, setStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewHtml, setOverviewHtml] = useState('');
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'onboarding' | 'critical'


  const [generating, setGenerating] = useState(false);
  const [generatingCritical, setGeneratingCritical] = useState(false);

  const BACKEND = import.meta.env.VITE_BACKEND_URL;

  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const incomingUser = location.state?.user;
    
    if (!incomingUser || !repoId) {
      navigate('/selectrepo');
      return;
    }

    setUser(incomingUser);
    setUserId(incomingUser.id); 
  }, []);

  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND}/api/tasks/${encodeURIComponent(repoId)}`);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTasks = async () => {
    setGenerating(true);
    try {
      await axios.post(`${BACKEND}/api/tasks/generate`, { repoId });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to generate tasks:', err);
    } finally {
      setGenerating(false);
    }
  };

  const markComplete = async (taskId) => {
    try {
      await axios.put(`${BACKEND}/api/tasks/${taskId}/complete`);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, isCompleted: true } : t))
      );
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [repoId]);

  useEffect(() => {
  if (!userId || !repoId) return;

  const startOnboarding = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/start`,
        { userId, repoId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setStep(response.data.step);
    } catch (err) {
      setError('Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  startOnboarding();
}, [userId, repoId]);


  const handleNext = async (input) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/next`,
        { userId, repoId, input },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const newStep = response.data.step;
      setStep(newStep);
      console.log(newStep.overviewId); // ✅ This will work


    } catch (err) {
      setError('Failed to proceed to the next step');
    } finally {
      setLoading(false);
    }
  };

const fetchOverview = async () => {
  if (!userId || !repoId) {
    setOverviewHtml('<p style="color:red;">Missing user or repo context.</p>');
    return;
  }

  setGenerating(true);
  try {
    // First, POST to generate the overview
    const generateRes = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/overview/generate`,
      { userId, repoId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const overviewId = generateRes.data.overviewId;

    if (!overviewId) {
      setOverviewHtml('<p style="color:red;">Failed to generate overview.</p>');
      return;
    }

    // Then GET the HTML for that overview
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/onboarding/overview/${overviewId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        responseType: 'text',
      }
    );

    setOverviewHtml(response.data);
  } catch (error) {
    console.error('Overview generation error:', error);
    setOverviewHtml('<p style="color:red;">Failed to generate overview.</p>');
  } finally {
    setGenerating(false);
  }
};
const fetchCriticalTasks = async () => {
  if (!userId || !repoId) return;

  setGeneratingCritical(true);
  try {
    const response = await axios.post(
      `${BACKEND}/api/onboarding/critical-tasks/generate`,
      { userId, repoId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    console.log(response);
    if (response.data.step) {
      setStep(response.data.step);
    } 
    else {
      console.warn('No updated step returned from critical-tasks/generate');
    }

  } catch (err) {
    console.error('Failed to generate critical tasks:', err);
  } finally {
    setGeneratingCritical(false);
  }
};


  const icons = {
    frontend: <Paintbrush className="w-8 h-8 text-cyan-300" />,
    backend: <Code className="w-8 h-8 text-cyan-300" />,
  };

  if (loading) return <div className="text-center py-10 text-blue-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!step || !step.stepId) return <div className="text-center text-gray-400 py-10">Unknown step</div>;

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-[#1A1C1E] text-gray-900">

  <DashboardSidebar repoId={repoId} user={user}/>
 <main className="flex-1 p-4 sm:p-6  overflow-y-auto">
  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="bg-white text-black rounded px-3 py-2 text-sm">
            <div className="font-semibold leading-tight">{user?.email}</div>
            <div className="text-xs -mt-1">Authenticated</div>
          </div>
        </div>

  <div className="h-screen overflow-auto text-black px-6 py-10">
    {/* Step: Choose Role */}
    {step.stepId === 'choose-role' && (
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-600  text-center z-10 text-white mt-20">
        HOW DO YOU WANT TO EXPLORE THIS <span className="text-[#2F89FF]">CODEBASE</span> ?
      </h1>
        <p className="text-xl text-[#d3d3d3] text-500 mb-12 mt-5">
          {step.prompt || 'Choose how you’d like to explore this project.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {step.options.map((option) => {
    const isFrontend = option.toLowerCase() === 'frontend';

    const frontendIcons = (
      <div className="flex gap-3 text-cyan-300 text-2xl">
        <SiReact />
        <SiTailwindcss />
        <SiJavascript />
      </div>
    );

    const backendIcons = (
      <div className="flex gap-3 text-green-300 text-2xl">
        <SiNodedotjs />
        <SiExpress />
        <SiMongodb />
      </div>
    );

    return (
      <button
        key={option}
        onClick={() => handleNext(option)}
        className="bg-[#111315] hover:bg-[#1a1d1f] border border-[#2c2f31] p-6 rounded-2xl shadow-lg text-left group transition-all"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="text-2xl font-600 text-white uppercase">{option}</div>
          {isFrontend ? frontendIcons : backendIcons}
        </div>
        <p className="text-gray-400 text-m">
          {isFrontend
            ? 'Explore components, design systems, and UI logic.'
            : 'Dive into API routes, services, and backend architecture.'}
        </p>
      </button>
    );
  })}
        </div>
      </div>
    )}

    {step.stepId === 'show-overview-and-tasks' && (
  <div className="max-w-5xl mx-auto text-white">
    <h2 className="text-3xl font-600 mb-2 uppercase">Context-Aware <span className="text-[#2F89FF]">Onboarding</span></h2>
    <div className="border-b border-gray-700 mb-6"></div>

    <div className="flex space-x-6 mb-6">
      {['overview', 'onboarding', 'critical'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize text-lg pb-1 border-b-2 transition-all ${
            activeTab === tab
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-blue-300'
          }`}
        >
          {tab === 'overview'
            ? 'Overview'
            : tab === 'onboarding'
            ? 'Onboarding Tasks'
            : 'Quality Audit'}
        </button>
      ))}
    </div>

    {activeTab === 'overview' && (
  <>
    {generating && !overviewHtml && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-[#111315] border border-[#2c2f31] rounded-2xl p-10 text-center shadow-2xl w-full max-w-xl">
          <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
            Generating Smart Overview...
          </h3>
          <p className="text-gray-400 mb-6">
            Our AI Agent is scanning your codebase and building a structured breakdown tailored to your selected path.
          </p>

          {/* Timeline loader */}
          <div className="flex justify-center items-center gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>

          <p className="text-sm text-gray-500 italic">Sit tight... This usually takes a minute.</p>
        </div>
      </div>
    )}

    {!overviewHtml && !generating && (
      <div className="text-center">
        <div className="flex flex-col items-center justify-center p-10 bg-[#111315] border border-[#2c2f31] rounded-2xl shadow-md">
          <div className="text-5xl mb-4 animate-pulse text-blue-400">
            <Code className="w-10 h-10" />
          </div>

          <h3 className="text-2xl text-white font-bold mb-2 tracking-wide">
            Smart Overview Generator
          </h3>

          <p className="text-gray-400 text-center max-w-xl mb-6">
            Let our <span className="text-blue-400 font-medium">AI Agent</span> scan your codebase and deliver a structured, component-wise breakdown tailored for your role.
          </p>

          <button
            onClick={fetchOverview}
            disabled={generating}
            className="bg-gradient-to-r from-[#2F89FF] to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <Paintbrush className="w-5 h-5" />
            Generate with AI
          </button>

          <p className="text-sm text-gray-500 mt-4 italic">
            * One-time process to tailor your onboarding.
          </p>
        </div>
      </div>
    )}

    {overviewHtml && <DetailedOverview html={overviewHtml} />}
  </>
)}


    {activeTab === 'onboarding' && (
      <OnboardingTasks
        tasks={tasks}
        loading={loading}
        generating={generating}
        onGenerate={generateTasks}
        onComplete={markComplete}
      />
    )}

    {activeTab === 'critical' && (
  <>
    {generatingCritical && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-[#111315] border border-[#2c2f31] rounded-2xl p-10 text-center shadow-2xl w-full max-w-xl">
          <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
            Auditing Code Quality...
          </h3>
          <p className="text-gray-400 mb-6">
            Scanning your codebase to surface maintainability improvements and fix suggestions.
          </p>
          <div className="flex justify-center items-center gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 italic">This won’t take long.</p>
        </div>
      </div>
    )}

    {!generatingCritical && (!step.tasks || step.tasks.length === 0) && (
      <div className="text-center">
        <div className="flex flex-col items-center justify-center p-10 bg-[#111315] border border-[#2c2f31] rounded-2xl shadow-md">
          <div className="text-5xl mb-4 animate-pulse text-sky-400">
            <Sparkles className="w-10 h-10" />
          </div>

          <h3 className="text-2xl text-white font-bold mb-2 tracking-wide">
            Code Quality Fixes
          </h3>

          <p className="text-gray-400 text-center max-w-xl mb-6">
            Run a quality scan to identify small but impactful <span className="text-blue-400 font-medium">improvements</span> in your code — lint issues, complexity alerts, and more.
          </p>

          <button
            onClick={fetchCriticalTasks}
            disabled={generatingCritical}
            className="bg-gradient-to-r from-sky-500 to-teal-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Run Quality Audit
          </button>

          <p className="text-sm text-gray-500 mt-4 italic">
            * Ideal for identifying pain points in your role’s area of the codebase.
          </p>
        </div>
      </div>
    )}

    {!generatingCritical && step.tasks && step.tasks.length > 0 && (
      <CriticalTasksAccordion tasks={step.tasks} />
    )}
  </>
)}


  </div>
)}


  </div>
  </main>
</div>
);

}

export default Onboarding;
