import { useState, useEffect } from 'react';
import React from 'react';

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import DashboardSidebar from '../components/common/DashboardSidebar';

export default function Hotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});

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
    fetchHotspots();
  }, [repoId]);

  const fetchHotspots = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(repoId)}`);
      const data = await res.json();
      setHotspots(data.hotspots);
      console.log(hotspots);

    } catch (err) {
      console.error('Hotspots fetch error:', err);
    }
  };

  const fetchSuggestions = async (nodeId) => {
    setLoadingSuggestions((prev) => ({ ...prev, [nodeId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(repoId)}/${encodeURIComponent(nodeId)}/suggestions`);
      const data = await res.json();
      if (data.success) {
        setSuggestions((prev) => ({ ...prev, [nodeId]: data.suggestions }));
      } else {
        setSuggestions((prev) => ({ ...prev, [nodeId]: 'No suggestions found.' }));
      }
    } catch {
      setSuggestions((prev) => ({ ...prev, [nodeId]: 'Error fetching suggestions.' }));
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [nodeId]: false }));
    }
  };

  return (
  <div className="flex flex-col sm:flex-row min-h-screen bg-[#111315] text-gray-900">
    <DashboardSidebar repoId={repoId} user={user} />

    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <div className="h-screen overflow-auto text-black px-6 py-10">
        <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Technical-Debt Hotspots
        </h3>

        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-zinc-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700 text-sm">
            <thead className="bg-gray-100 dark:bg-zinc-800 text-left text-gray-600 dark:text-gray-300 font-semibold">
              <tr>
                <th className="px-4 py-3">Function</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Complexity</th>
                <th className="px-4 py-3">Debt Score</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-gray-800 dark:text-gray-100">
  {hotspots.map((h) => (
    <React.Fragment key={h.nodeId}>
      <tr
        className={`hover:bg-gray-50 dark:hover:bg-zinc-900 transition ${
          suggestions[h.nodeId] ? 'bg-zinc-50 dark:bg-zinc-900/30' : ''
        }`}
      >
        <td className="px-4 py-3 font-medium">{h.nodeId.split("::")[1]}</td>
        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
          {h.filePath.split("reposensei")[1] || h.filePath}
        </td>
        <td className="px-4 py-4">{h.complexity}</td>
        <td className="px-4 py-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${
              h.debtScore < 0.3
                ? 'bg-green-200/20 text-green-300 border-green-300/30'
                : h.debtScore < 0.7
                ? 'bg-yellow-200/20 text-yellow-200 border-yellow-200/30'
                : 'bg-red-200/20 text-red-300 border-red-300/30'
            }`}
          >
            {h.debtScore.toFixed(2)}
          </span>
        </td>
        <td className="px-4 py-4 space-x-2">
          <button
            onClick={() => fetchSuggestions(h.nodeId)}
            className="px-3 py-2 text-xs rounded bg-[#2F89FF] text-white hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={loadingSuggestions[h.nodeId]}
          >
            {loadingSuggestions[h.nodeId] ? "Loading..." : suggestions[h.nodeId] ? "Hide" : "Get Suggestions"}
          </button>
        </td>
      </tr>

      {suggestions[h.nodeId] && (
        <tr>
          <td colSpan="5" className="px-4 py-5 border-l-4 border-[#2F89FF] bg-zinc-50 dark:bg-zinc-800/50">
            <div className="space-y-4 text-base leading-relaxed text-gray-900 dark:text-gray-100 font-medium">
              {suggestions[h.nodeId]
                .split('\n\n')
                .map((block, i) => {
                  if (/^\*\*(.*?)\*\*$/.test(block.trim())) {
                    return (
                      <h4
                        key={i}
                        className="text-xl font-bold text-[#2F89FF] dark:text-[#2F89FF] mt-4 mb-2"
                      >
                        {block.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }

                  if (block.trim().startsWith('```javascript')) {
                    return (
                      <pre
                        key={i}
                        className="bg-gray-900 text-green-300 text-sm rounded-xl p-4 overflow-x-auto"
                      >
                        <code>{block.replace(/```javascript|```/g, '')}</code>
                      </pre>
                    );
                  }

                  const inlineCodeSplit = block.split(/(`[^`]+`)/g);
                  return (
                    <p key={i} className="text-base">
                      {inlineCodeSplit.map((chunk, idx) =>
                        /^`[^`]+`$/.test(chunk) ? (
                          <code
                            key={idx}
                            className="bg-black dark:bg-zinc-700 text-[#2F89FF] dark:text-[#2F89FF] font-mono px-1.5 py-0.5 rounded text-sm"
                          >
                            {chunk.slice(1, -1)}
                          </code>
                        ) : (
                          <span key={idx}>{chunk}</span>
                        )
                      )}
                    </p>
                  );
                })}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </main>
  </div>
);


}
