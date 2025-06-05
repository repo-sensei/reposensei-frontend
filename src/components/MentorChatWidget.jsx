import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';

export default function MentorChatWidget({ repoId }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [logs, setLogs] = useState([]);
  const user = supabase.auth.session()?.user;

  useEffect(() => {
    if (open && repoId) fetchLogs();
  }, [open, repoId]);

  const fetchLogs = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chat/logs/${repoId}`);
    setLogs(res.data.logs);
  };

  const sendQuestion = async () => {
    if (!question.trim() || !user) return;
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/ask`, {
      repoId,
      userId: user.id,
      question
    });
    setQuestion('');
    fetchLogs();
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
          <h4 className="font-bold mb-2">Ask RepoSensei</h4>
          <div className="h-48 overflow-y-auto border p-2 mb-2">
            {logs.map((log) => (
              <div key={log.id} className="mb-3">
                <p className="text-sm font-semibold">Q: {log.question}</p>
                <p className="text-sm text-gray-700">A: {log.answer}</p>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question..."
              className="border p-1 flex-grow mr-2"
            />
            <button onClick={sendQuestion} className="px-3 py-1 bg-blue-600 text-white rounded">
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg z-50"
      >
        {open ? '×' : '💬'}
      </button>
    </>
  );
}
