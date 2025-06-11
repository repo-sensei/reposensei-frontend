import {
  Building2,
  Briefcase,
  Flame,
  GitCompare,
  UserCircle,
  RefreshCcw,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Ensure this import is present

export default function DashboardSidebar({ repoId, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("profile");

  useEffect(() => {
    if (location.pathname.includes("/onboarding")) setActive("onboarding");
    else if (location.pathname.includes("/docs")) setActive("architecture");
    else setActive("profile");
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
   const handleRefresh = async () => {
    if (!user || !repoId) return;
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/repo/scan`, {
      repoUrl: `https://github.com/${repoId}`, 
      repoId,
      userId: user.id,
    });
    alert('Repo scan triggered!');
  };
  const menu = [
    {
      id: "profile",
      label: "Profile",
      icon: UserCircle,
      onClick: () => navigate(`/dashboard/${encodeURIComponent(repoId)}`, {
      state: { user },
    }),
    },
    {
      id: "architecture",
      label: "Architecture",
      icon: Building2,
      onClick: () => navigate(`/docs/${encodeURIComponent(repoId)}`),
    },
    {
      id: "onboarding",
      label: "Onboarding",
      icon: Briefcase,
      onClick: () =>
        navigate(`/onboarding/${encodeURIComponent(repoId)}`, {
          state: { user },
        }),
    },
    {
      id: "hotspots",
      label: "Hotspots",
      icon: Flame,
      disabled: true,
    },
    {
      id: "changes",
      label: "Changes",
      icon: GitCompare,
      disabled: true,
    },
  ];

  return (
    <aside className="w-full sm:w-64 h-auto sm:h-screen bg-[#111315] text-white px-6 py-8 shadow-lg flex-shrink-0 flex flex-col justify-between rounded-xl">
      {/* Heading and Menu */}
      <div>
        <p className="text-2xl font-600 mb-10 tracking-wide text-left">
            Repo<span className="text-[#2F89FF]">Sensei</span>
        </p>

        <div className="flex flex-col items-center space-y-6">
          {menu.map(({ id, label, icon: Icon, onClick, disabled }) => (
            <button
              key={id}
              onClick={onClick}
              disabled={disabled}
              className={`flex flex-row items-center px-4 py-2 rounded-xl w-full transition
                ${disabled ? "opacity-30 cursor-not-allowed" : ""}
                ${active === id ? "text-[#2F89FF]" : "text-white hover:bg-white/10"}`}
            >
              <Icon className={`w-6 h-6 ${active === id ? "text-[#2F89FF]" : "text-white"}`} />
              <span className={`text-sm ml-4 ${active === id ? "font-semibold" : ""}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col items-center space-y-4">
        <button 
            onClick={handleRefresh}
            className="text-sm flex items-center justify-center px-4 py-2 bg-[#37BD6B]/15 text-[#37BD6B] rounded hover:bg-[#37BD6B]/25 transition w-full"
            >
            <RefreshCcw className="w-5 h-5 mr-2" /> Refresh Changes
            </button>


        <button
          onClick={() => navigate("/selectrepo")}
          className=" text-sm flex items-center justify-center px-4 py-2 bg-[#2F89FF] text-white-800 rounded hover:bg-gray-400 transition w-full"
        >
          <FolderOpen className="w-5 h-5 mr-2" /> Select Repo
        </button>

      </div>
    </aside>
  );
}
