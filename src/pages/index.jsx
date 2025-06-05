import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = supabase.auth.session();
    if (session) navigate('/dashboard');
  }, []);

  const signInWithGitHub = async () => {
    await supabase.auth.signIn({ provider: 'github' });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to RepoSensei</h1>
      <button onClick={signInWithGitHub} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
        Sign in with GitHub
      </button>
    </div>
  );
}
