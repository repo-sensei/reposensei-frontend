// components/onboarding/OnboardingTasks.jsx
import { CheckCircle2, Brain, Wrench, Pin } from 'lucide-react';

const OnboardingTasks = ({ tasks, loading, generating, onGenerate, onComplete }) => {
  const isArchitectureOverview = (task) =>
    task.title.toLowerCase() === 'architecture overview';

  // Separate "Architecture Overview" as README
  const overviewTask = tasks.find(isArchitectureOverview);

  // Group other tasks
  const archTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().startsWith('arch') && !isArchitectureOverview(task)
  );
  const fixTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().startsWith('fix') && !isArchitectureOverview(task)
  );
  const otherTasks = tasks.filter(
    (task) =>
      !archTasks.includes(task) &&
      !fixTasks.includes(task) &&
      !isArchitectureOverview(task)
  );

  const renderTaskGroup = (title, IconComponent, taskList, glowColor) => {
    if (taskList.length === 0) return null;
    return (
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <ul className="space-y-4">
          {taskList.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onComplete={onComplete}
              Icon={IconComponent}
              glowColor={glowColor}
            />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="mt-10 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Onboarding Tasks</h2>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="px-4 py-2 text-sm font-medium rounded-xl transition-colors bg-[#2F89FF] hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {generating ? 'Generating...' : 'Generate Tasks'}
        </button>
      </div>

      {/* Loading / No Tasks */}
      {loading ? (
        <p className="text-gray-400">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400">No tasks found. Click "Generate Tasks".</p>
      ) : (
        <div className="space-y-12">

          {/* README Overview */}
          {overviewTask && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">README Overview</h3>
              <div className="text-gray-300 space-y-1">
                <p className="text-lg font-medium text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(255,255,0,0.5)]" />
                 
                </p>
                <p className="text-m text-gray-400 text-justify">{overviewTask.description}</p>
                
              </div>
            </div>
          )}

          {/* Task Groups */}
          {renderTaskGroup('Architecture Tasks', Brain, archTasks, 'text-yellow-400')}
          {renderTaskGroup('Fixes & Maintenance', Wrench, fixTasks, 'text-orange-400')}
          {renderTaskGroup('Other Tasks', Pin, otherTasks, 'text-blue-400')}
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, onComplete, Icon, glowColor }) => (
 <li
  className={`p-4 rounded-2xl border flex justify-between items-start transition-colors ${
    task.isCompleted
      ? 'bg-green-900/30 border-green-500'
      : 'bg-[#111315] border-gray-700'
  }`}
>
  <div className="flex-1 space-y-1">
    <p className="font-semibold text-white flex items-center gap-2">
      <Icon className={`w-5 h-5 ${glowColor} drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]`} />
      {task.title}
    </p>
    <p className="text-sm text-gray-400">{task.description}</p>
  </div>
  {!task.isCompleted && (
    <button
      onClick={() => onComplete(task._id)}
      className="text-green-400 hover:text-green-500 transition"
      aria-label="Mark as complete"
    >
      <CheckCircle2 className="w-6 h-6" />
    </button>
  )}
</li>

);

export default OnboardingTasks;
