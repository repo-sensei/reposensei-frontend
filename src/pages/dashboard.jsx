import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
    const repoId = newRepoUrl.replace('https://github.com/', '').replace('https://gitlab.com/', '');
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/scan`, {
      repoUrl: newRepoUrl,
      repoId,
      userId: user.id
    });
    setNewRepoUrl('');
    fetchRepos();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Your Repositories</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex">
        <input
          type="text"
          value={newRepoUrl}
          onChange={(e) => setNewRepoUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          className="border p-2 flex-grow mr-2"
        />
        <button onClick={connectRepo} className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Connect Repo
        </button>
      </div>

      <ul className="space-y-4">
        {repos.map((r) => (
          <li key={r.repoId} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.repoId}</p>
              <p className="text-sm text-gray-500">
                Last Scanned: {new Date(r.lastScanned).toLocaleString()}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => navigate(`/docs/${encodeURIComponent(r.repoId)}`)}
                className="px-3 py-1 border rounded"
              >
                View Docs
              </button>
              
              <button
                onClick={() =>
                  navigate(`/onboarding/${encodeURIComponent(r.repoId)}`, {
                    state: { userId: user.id },
                  })
                }
                className="px-3 py-1 border rounded"
              >
                Onboarding
              </button>

              <button
                onClick={() => {
                  axios
                    .post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/scan`, {
                      repoUrl: r.repoUrl,
                      repoId: r.repoId,
                      userId: user.id,
                    })
                    .then(fetchRepos);
                }}
                className="px-3 py-1 border rounded"
              >
                Refresh
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
