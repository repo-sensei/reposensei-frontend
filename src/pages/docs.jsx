import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MentorChatWidget from '../components/MentorChatWidget';

export default function DocsSite() {
  const { repoId } = useParams();
  const decodedRepoId = decodeURIComponent(repoId);
  const [svgUrl, setSvgUrl] = useState('');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [changeSummary, setChangeSummary] = useState('');
  const [suggestions, setSuggestions] = useState({}); // nodeId -> string (suggestions text)
  const [loadingSuggestions, setLoadingSuggestions] = useState({}); 

  useEffect(() => {
    if (!repoId) return;
    fetchArchitecture();
    fetchHotspots();
    //fetchChanges();
  }, [repoId]);

  const fetchArchitecture = async () => {
  try {
    const resJson = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/docs/architecture/${encodeURIComponent(decodedRepoId)}`
    );
    console.log('Architecture JSON:', resJson.data);
    if (resJson.data.svgUrl) {
      setSvgUrl(`${import.meta.env.VITE_BACKEND_URL}${resJson.data.svgUrl}`);
      return;
    }
  } catch (e) {
    console.error('Error fetching JSON SVG:', e);
  }

  try {
    const resSvg = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/docs/architecture/${encodeURIComponent(decodedRepoId)}`,
      { responseType: 'text' }
    );
    console.log('SVG fallback data:', resSvg.data);
    if (resSvg.headers['content-type']?.includes('image/svg+xml')) {
      setSvgMarkup(resSvg.data);
    }
  } catch (err) {
    console.error('Error fetching fallback raw SVG:', err);
  }
};


  const fetchHotspots = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(decodedRepoId)}`
      );
      setHotspots(res.data.hotspots);
    } catch (err) {
      console.error('Hotspots fetch error:', err);
    }
  };
  const fetchSuggestions = async (nodeId) => {
    setLoadingSuggestions((prev) => ({ ...prev, [nodeId]: true }));
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(decodedRepoId)}/${encodeURIComponent(nodeId)}/suggestions`
      );
      if (res.data.success) {
        setSuggestions((prev) => ({ ...prev, [nodeId]: res.data.suggestions }));
      } else {
        setSuggestions((prev) => ({ ...prev, [nodeId]: 'No suggestions found.' }));
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
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
          {/* If we have a URL, render via <img> */}
          
          {svgUrl ? (
            
            <img src={svgUrl} alt="Architecture Graph" className="max-w-full h-auto" />
          ) : svgMarkup ? (
            <div className="max-w-full overflow-auto" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
          ) : (
            <p>Loading graph...</p>
          )}
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
