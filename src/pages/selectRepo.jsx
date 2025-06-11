import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react'; // loader icon
import { SiNodedotjs, SiJavascript, SiReact, SiTailwindcss } from "react-icons/si";

const SelectRepo = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [loadingRepo, setLoadingRepo] = useState(false);

  
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchRepos();
  }, [user]);

  const fetchRepos = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/repo/list`, {
      params: { userId: user.id }
    });
    setRepos(res.data.repos);
  };

  const connectRepo = async () => {
    setShowRepoModal(false);
    setLoadingRepo(true);
    const repoId = newRepoUrl.replace('https://github.com/', '').replace('https://gitlab.com/', '');
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/scan`, {
      repoUrl: newRepoUrl,
      repoId,
      userId: user.id
    });
    setNewRepoUrl('');
    await fetchRepos();
    setLoadingRepo(false);
  };

  const handleContinue = () => {
    if (selectedRepoId) {
      navigate(`/dashboard/${encodeURIComponent(selectedRepoId)}`, {
        state: { user }
      });
    } else {
      alert("Please select a repository.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111315] text-white p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-6 left-8 z-10 ">
        <p className="text-2xl font-600">
            Repo<span className="text-[#2F89FF]">Sensei</span>
        </p>

      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          className="text-sm px-4 py-3 bg-white/10 rounded hover:bg-white/20"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/');
          }}
        >
          LOGOUT
        </button>
        <div className="bg-white text-black rounded px-3 py-2 text-sm">
          <div className="font-semibold leading-tight">{user?.email}</div>
          <div className="text-xs -mt-1">Authenticated</div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-screen w-full">

      <h1 className="text-3xl sm:text-4xl font-500  text-center z-10">
        GET STARTED WITH A <span className="text-[#2F89FF]">CODEBASE</span>
      </h1>

      {/* Buttons */}
      <div className="mt-6 flex gap-3 z-10">
        <button
          onClick={() => setShowRepoModal(true)}
          className="bg-[#2F89FF] text-white px-5 py-2 rounded text-m"
        >
          NEW PROJECT +
        </button>
        <button className="bg-white text-black px-5 py-2 rounded text-m">
          SELECT PROJECT
        </button>
      </div>

      {/* Repo List */}
      <div className="bg-black/20 rounded mt-10 w-full max-w-xl p-4 z-10">
        <h2 className="text-sm text-white/60 mb-2">RECENTLY OPENED</h2>
        {repos.map((repo) => (
          <div
            key={repo.repoId}
            className={`mb-3 bg-[#111315] border ${selectedRepoId === repo.repoId ? 'border-[#2F89FF]' : 'border-gray-700'} text-m rounded p-4 cursor-pointer hover:border-[#2F89FF]`}
            onClick={() => setSelectedRepoId(repo.repoId)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono break-all">{repo.repoId}</p>
                <p className="text-xs text-white/50">
                  Last Scanned: {new Date(repo.lastScanned).toLocaleString()}
                </p>
              </div>
             <div className="flex items-center gap-3 text-white text-xl">
                <SiNodedotjs className="text-green-500" title="Node.js" />
                <SiJavascript className="text-yellow-400" title="JavaScript" />
                <SiReact className="text-cyan-400" title="React" />
                <SiTailwindcss className="text-blue-400" title="Tailwind CSS" />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="mt-10 bg-[#2F89FF] text-white px-10 py-3 text-sm rounded z-10"
      >
        CONTINUE
      </button>
    </div>  
      {/* Modal */}
      {showRepoModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <div className="fixed top-1/2 left-1/2 w-full max-w-xl p-8 bg-white rounded-2xl shadow-xl z-50 transform -translate-x-1/2 -translate-y-1/2 text-gray-900">
            <button
              onClick={() => setShowRepoModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 pr-8 text-center">Connect a Repository</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500 w-full"
              />
              <button
                onClick={connectRepo}
                disabled={!newRepoUrl.trim()}
                className="px-6 py-3 bg-[#2F89FF] text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Connect Repository
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Supported: GitHub, GitLab
            </p>
          </div>
        </>
      )}

      {/* Loader Overlay */}
      {loadingRepo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-400 w-10 h-10" />
            <p className="text-white text-lg">Connecting Repository...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectRepo;
