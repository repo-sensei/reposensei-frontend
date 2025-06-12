import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardSidebar from '../components/common/DashboardSidebar';

export default function RecentChanges() {
  const [changeSummary, setChangeSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const { repoId } = useParams();
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

  useEffect(() => {
    if (!repoId) return;

    const fetchChanges = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/changes/${encodeURIComponent(repoId)}`
        );
        setChangeSummary(res.data.summary);
      } catch (err) {
        console.error('Changes fetch error:', err);
        setChangeSummary('Error fetching change summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchChanges();
  }, [repoId]);

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-[#111315] text-gray-100">
      <DashboardSidebar repoId={repoId} user={user} />
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-white">Recent Changes</h3>

          {loading ? (
            <div className="relative pl-6 py-4">
              <div className="border-l-4 border-indigo-500 h-full absolute left-3 top-0"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-6 relative">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full absolute -left-[7px] top-1"></div>
                  <div className="ml-4 animate-pulse">
                    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
              <p className="text-sm text-zinc-400 mt-4 ml-1">Fetching recent commits...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap border border-gray-700 p-4 rounded-lg bg-[#1c1f22] text-gray-200">
              {changeSummary}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
