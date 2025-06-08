import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MentorChatWidget from '../components/MentorChatWidget';
import ArchitectureGraph from '../components/ArchitectureGraph';  // Import your new component

export default function DocsSite() {
  const { repoId } = useParams();
  const decodedRepoId = decodeURIComponent(repoId);


  const [hotspots, setHotspots] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    if (!repoId) return;
    fetchHotspots();
    // fetchChanges(); 
  }, [repoId]);

  const fetchHotspots = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(decodedRepoId)}`);
      const data = await res.json();
      setHotspots(data.hotspots);
    } catch (err) {
      console.error('Hotspots fetch error:', err);
    }
  };

  const fetchSuggestions = async (nodeId) => {
    setLoadingSuggestions((prev) => ({ ...prev, [nodeId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(decodedRepoId)}/${encodeURIComponent(nodeId)}/suggestions`);
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

  const fetchChanges = async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/changes/${encodeURIComponent(decodedRepoId)}`,
        { params: { since: oneWeekAgo } }
      );
      setChangeSummary(res.data.summary);
    } catch (err) {
      console.error('Changes fetch error:', err);
    }
  };

  return (
    <div className="p-8 relative">
      <h2 className="text-3xl font-bold mb-4">Documentation for {repoId}</h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Architecture Graph</h3>
        <div className="border p-4 rounded-lg flex justify-center">
          {/* Render new ArchitectureGraph component */}
          <ArchitectureGraph repoId={decodedRepoId} />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Technical-Debt Hotspots</h3>
        <ul className="space-y-4">
          {hotspots.map((h) => (
            <li key={h.nodeId} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <span>
                  <strong>{h.nodeId.split('::')[1]}</strong> in {h.filePath}
                </span>
                <span className={`px-2 py-1 rounded ${h.complexity > 10 ? 'bg-red-200' : 'bg-blue-200'}`}>
                  C: {h.complexity} {h.hasTODO && '🚧'} {h.testCoverage !== null && `| Cov: ${h.testCoverage}%`}
                </span>
              </div>

              <button
                className="mb-2 px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
                onClick={() => fetchSuggestions(h.nodeId)}
                disabled={loadingSuggestions[h.nodeId]}
              >
                {loadingSuggestions[h.nodeId] ? 'Loading...' : 'Get Refactor Suggestions'}
              </button>

              {suggestions[h.nodeId] && (
                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{suggestions[h.nodeId]}</pre>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Recent Changes (Last 7 days)</h3>
        <pre className="whitespace-pre-wrap border p-4 rounded-lg bg-gray-50">{changeSummary}</pre>
      </section>

      <MentorChatWidget repoId={repoId} />
    </div>
  );
}
