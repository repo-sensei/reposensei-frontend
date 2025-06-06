import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import MentorChatWidget from '../components/MentorChatWidget';

export default function DocsSite() {
  const { repoId } = useParams();
  const decodedRepoId = decodeURIComponent(repoId);
  const [mermaidCode, setMermaidCode] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    if (!repoId) return;
    fetchArchitecture();
    fetchHotspots();
    fetchChanges();
  }, [repoId]);

  const fetchArchitecture = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/docs/architecture/${encodeURIComponent(decodedRepoId)}`);
      const mermaidText = res.data.mermaid;

      setMermaidCode(mermaidText); // this puts it in the <pre> for Mermaid to pick up

      // Initialize and run after short delay to let React render <pre>
      setTimeout(() => {
        mermaid.initialize({ startOnLoad: false });
        mermaid.run(); // tells Mermaid to look for <pre class="mermaid"> and render it
      }, 0);
    } catch (err) {
      console.error('Mermaid graph fetch/render error:', err);
    }
};



  const fetchHotspots = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/docs/hotspots/${encodeURIComponent(decodedRepoId)}`);
    setHotspots(res.data.hotspots);
  };

  const fetchChanges = async () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/changes/${encodeURIComponent(decodedRepoId)}`, {
      params: { since: oneWeekAgo }
    });
    setChangeSummary(res.data.summary);
  };

  return (
    <div className="p-8 relative">
      <h2 className="text-3xl font-bold mb-4">Documentation for {repoId}</h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Architecture Graph</h3>
        <div className="border p-4 rounded-lg">
          <pre className="mermaid">{mermaidCode}</pre>
        </div>
      </section>


      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Technical-Debt Hotspots</h3>
        <ul className="space-y-2">
          {hotspots.map((h) => (
            <li key={h.nodeId} className="flex justify-between">
              <span>
                <strong>{h.nodeId.split('::')[1]}</strong> in {h.filePath}
              </span>
              <span className={`px-2 py-1 rounded ${h.complexity > 10 ? 'bg-red-200' : 'bg-blue-200'}`}>
                C: {h.complexity} {h.hasTODO && '🚧'} {h.testCoverage !== null && `| Cov: ${h.testCoverage}%`}
              </span>
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
