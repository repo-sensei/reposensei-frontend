import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardSidebar from '../components/common/DashboardSidebar';

export default function RecentChanges() {
  const [changeSummary, setChangeSummary] = useState('');
  const [formattedSummary, setFormattedSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const { repoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const incomingUser = location.state?.user;

    if (!incomingUser || !repoId) {
      navigate('/selectrepo');
      return;
    }

    setUser(incomingUser);
  }, []);

  useEffect(() => {
    if (!repoId) return;

    const fetchChanges = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/changes/${encodeURIComponent(repoId)}`
        );
        const raw = res.data.summary;
        setChangeSummary(raw);
        setFormattedSummary(formatMarkdown(raw));
      } catch (err) {
        console.error('Changes fetch error:', err);
        setChangeSummary('Error fetching change summary.');
      } finally {
        setLoading(false);
      }
    };

    //fetchChanges();
  }, [repoId]);

  const formatMarkdown = (text) => {
  if (!text) return '';

  return text
    // Escape HTML special characters to prevent rendering issues
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Headings: ###, ##, ####
    .replace(/^#### (.*$)/gim, '<h4 class="text-md font-semibold mt-3 mb-1 text-indigo-300">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2 text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-4 mb-2 text-white">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-4 mb-2 text-white">$1</h1>')

    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-400">$1</strong>')

    // Inline code or file paths: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-sm text-green-400">$1</code>')

    // Numbered lists: 1. Item
    .replace(/^\d+\.\s(.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')

    // Bullet points: - Item
    .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')

    // Wrap list items in <ul> or <ol> manually
    .replace(/(<li class="ml-6 list-disc">[\s\S]*?<\/li>)/gim, '<ul class="my-2">$1</ul>')
    .replace(/(<li class="ml-6 list-decimal">[\s\S]*?<\/li>)/gim, '<ol class="my-2">$1</ol>')

    // Paragraph breaks
    .replace(/\n{2,}/g, '<br /><br />')
    .replace(/\n/g, '<br />');
};


  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-[#111315] text-gray-100">
      <DashboardSidebar repoId={repoId} user={user} />
       <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
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
            <div
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: formattedSummary }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
