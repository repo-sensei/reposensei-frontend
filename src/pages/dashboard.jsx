import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import DashboardSidebar from '../components/common/DashboardSidebar';

export default function Dashboard() {
  const { repoId } = useParams(); // Get from route param
  const location = useLocation();
  const navigate = useNavigate();

const [user, setUser] = useState(null);

useEffect(() => {
  const user = location.state?.user;

  if (!user || !repoId) {
    navigate('/selectrepo');
    return;
  }

  setUser(user); 
}, []);

  return (
   <div className="flex flex-col sm:flex-row min-h-screen bg-[#1A1C1E] text-gray-900">
  {/* Sidebar */}
  <DashboardSidebar repoId={repoId} user={user} />

  <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">
        Dashboard for <span className="text-[#2F89FF] break-all">{repoId}</span>
      </h2>

     <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
             <button
               className="text-sm text-white px-4 py-3 bg-white/10 rounded hover:bg-white/20"
               onClick={async () => {
                 await supabase.auth.signOut();
                 navigate('/');
               }}
             >
               LOGOUT
             </button>
             <div className="bg-white text-black rounded px-3 py-2 text-sm">
               <div className="font-semibold leading-tight">{user?.email}</div>
               <div className="text-xs -mt-1">Authenticated</div>
             </div>
           </div>
    </div>

    {/* Body Section */}
    <section className="bg-white border border-gray-200 rounded-xl shadow p-4 sm:p-6">
      <p className="text-gray-700 text-sm sm:text-base">
        Use the sidebar to navigate to <strong>Docs</strong> or <strong>Onboard</strong> tools
        for this repository.
      </p>
    </section>
  </main>
</div>

  );
}
