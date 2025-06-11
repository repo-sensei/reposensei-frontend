// components/onboarding/CriticalTasksAccordion.jsx
import { FileText, Hash, Flame, AlertTriangle, CheckCircle } from "lucide-react";

const SEVERITY_STYLES = {
  1: {
    label: "Low",
    color: "bg-green-600 text-white",
    icon: <CheckCircle size={16} className="text-green-300" />,
  },
  2: {
    label: "Medium",
    color: "bg-yellow-500 text-black",
    icon: <AlertTriangle size={16} className="text-yellow-300" />,
  },
  3: {
    label: "High",
    color: "bg-red-600 text-white",
    icon: <Flame size={16} className="text-red-400" />,
  },
};

const CriticalTasksAccordion = ({ tasks }) => {
  const grouped = tasks.reduce((acc, task) => {
    acc[task.file] = acc[task.file] || [];
    acc[task.file].push(task);
    return acc;
  }, {});

  const cleanPath = (fullPath) => {
    const parts = fullPath.split("reposensei");
    return parts.length > 1 ? parts[1].replaceAll("\\", "/") : fullPath;
  };

  return (
    <div className="space-y-6 mt-10 text-white">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-2 text-white">Critical Code Issues</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          These tasks identify important code issues like <span className="text-yellow-400">ESLint warnings</span>, 
          <span className="text-red-400"> complex logic</span>, or 
          <span className="text-green-400"> bad practices</span>. Resolving them improves code quality and speeds up onboarding.
        </p>
      </div>

      {Object.entries(grouped).map(([file, taskList], idx) => (
        <details
          key={idx}
          className="border border-gray-700 rounded-xl bg-[#111315] shadow-sm transition-all duration-300 overflow-hidden group"
        >
          <summary className="cursor-pointer select-none px-5 py-4 font-semibold text-white hover:bg-gray-800 flex items-center gap-3">
            <FileText size={18} className="text-gray-400" />
            <span className="truncate text-m">{cleanPath(file)}</span>
            <span className="ml-auto text-sm text-gray-500">{taskList.length} issue(s)</span>
          </summary>

          <ul className="px-6 py-4 space-y-4 bg-[#1a1d1f]">
            {taskList.map((task, i) => {
              const style = SEVERITY_STYLES[task.severity] || SEVERITY_STYLES[1];

              return (
                <li key={i} className="bg-[#23272a] p-4 rounded-lg shadow flex flex-col gap-2 border border-gray-700">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Hash size={16} className="text-gray-500" />
                    <span>Line {task.line}</span>
                    <span className={`ml-auto flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${style.color}`}>
                      {style.icon}
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-100 leading-snug">
                    {task.description !== "none" ? task.description : "No description provided."}
                  </p>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
};

export default CriticalTasksAccordion;
