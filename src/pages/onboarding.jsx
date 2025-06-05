import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function OnboardingPage() {
  const { repoId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (repoId) fetchTasks();
  }, [repoId]);

  const fetchTasks = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${repoId}`);
    setTasks(res.data.tasks);
  };

  const completeTask = async (taskId) => {
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}/complete`);
    fetchTasks();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">First 7 Tasks for {repoId}</h2>
      <ul className="space-y-4">
        {tasks.map((t) => (
          <li key={t._id} className="border p-4 rounded-lg flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-gray-600">{t.description}</p>
              {t.fileLink && (
                <a href={t.fileLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  View Code
                </a>
              )}
            </div>
            <div className="flex flex-col items-end">
              {t.command && (
                <button
                  onClick={() => window.open(`vscode://file/${t.command}`, '_blank')}
                  className="mb-2 px-3 py-1 border rounded"
                >
                  Open in Editor
                </button>
              )}
              <button
                onClick={() => completeTask(t._id)}
                className={`px-3 py-1 rounded ${t.isCompleted ? 'bg-green-500 text-white' : 'border'}`}
              >
                {t.isCompleted ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
