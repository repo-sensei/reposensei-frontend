import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import MainLayout from '../components/common/MainLayout';

export default function PersonalBranding() {
  const { repoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState(null);
  const [resumeSection, setResumeSection] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [role, setRole] = useState('Developer');
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const incomingUser = location.state?.user;

    if (!incomingUser || !repoId) {
      navigate('/selectrepo');
      return;
    }

    setUser(incomingUser);
    setProjectName(repoId.split('/')[1] || 'Project'); // Extract repo name
  }, []);

  const testGitHubUsername = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal-branding/test-username/${user.id}`
      );
      
      setGithubUsername(response.data.githubUsername);
      console.log('GitHub username test result:', response.data);
      
    } catch (err) {
      console.error('GitHub username test error:', err);
      setError(err.response?.data?.error || 'Failed to test GitHub username mapping');
    } finally {
      setLoading(false);
    }
  };

  const generateResumeSection = async () => {
    if (!user || !repoId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/personal-branding/resume-section`,
        {
          repoUrl: `https://github.com/${repoId}`,
          repoId,
          userId: user.id,
          role,
          projectName,
          startDate,
          endDate
        }
      );
      
      setResumeSection(response.data.resumeSection);
      console.log('Resume section generated:', response.data);
      
    } catch (err) {
      console.error('Resume generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate resume section');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} repoId={repoId}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Personal Branding - {repoId}
        </h1>

        {/* Resume Generation Section */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Resume Section</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Frontend Developer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., E-commerce Platform"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={generateResumeSection}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Resume Section'}
          </button>
        </div>

        {/* Generated Resume Section */}
        {resumeSection && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Resume Section</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {resumeSection}
              </pre>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(resumeSection)}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 