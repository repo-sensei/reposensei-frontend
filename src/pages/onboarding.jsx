import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OnboardingPage() {
  const { repoId } = useParams();
  const decodedRepoId = decodeURIComponent(repoId);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (repoId) {
      fetchTasks();
    }
  }, [repoId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${encodeURIComponent(decodedRepoId)}`);
      setTasks(res.data.tasks);

      // If no tasks, generate then fetch again
      if (res.data.tasks.length === 0) {
        await generateTasks();
      }
    } catch (err) {
      console.error("Failed to fetch onboarding tasks:", err);
      setError("Failed to fetch onboarding tasks.");
    } finally {
      setLoading(false);
    }
  };

  const generateTasks = async () => {
    setGenerating(true);
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/generate`, {
        repoId: decodedRepoId,
      });
      await fetchTasks();
    } catch (err) {
      console.error("Failed to generate onboarding tasks:", err);
      setError("Failed to generate onboarding tasks.");
    } finally {
      setGenerating(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}/complete`);
      fetchTasks(); // Refresh tasks after marking complete
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">First 7 Tasks for {decodedRepoId}</h2>

      <button
        onClick={generateTasks}
        disabled={generating}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {generating ? "Generating Tasks..." : "Refresh Tasks"}
      </button>

      {loading ? (
        <div className="text-gray-500 animate-pulse">⏳ Loading tasks...</div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((t) => (
            <li key={t._id} className="border p-4 rounded-lg flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-gray-600">{t.description}</p>
                
                <button
                  onClick={() => completeTask(t._id)}
                  className={`px-3 py-1 rounded ${
                    t.isCompleted ? 'bg-green-500 text-white' : 'border'
                  }`}
                >
                  {t.isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
