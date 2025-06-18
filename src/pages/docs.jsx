import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react'; // ✅ FIXED

import MainLayout from '../components/common/MainLayout';
import ArchitectureGraph from '../components/ArchitectureGraph';

export default function DocsArchitecture() {
  const { repoId } = useParams();
  const decodedRepoId = decodeURIComponent(repoId);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const incomingUser = location.state?.user;

    if (!incomingUser || !repoId) {
      navigate('/selectrepo');
      return;
    }

    setUser(incomingUser);
    setUserId(incomingUser.id);
  }, []);

  return (
    <MainLayout user={user} repoId={repoId}>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-2">Architecture Graph</h3>
            <div className="border border-gray-700 p-4 rounded-lg bg-[#1a1d1f] flex justify-center">
              <ArchitectureGraph repoId={decodedRepoId} />
            </div>
          </section>
       
      </MainLayout>
  );
}
