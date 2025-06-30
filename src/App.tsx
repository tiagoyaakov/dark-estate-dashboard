import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./components/LoginPage";
import { UserOnboarding } from "./components/UserOnboarding";
import { ContractTemplatesProvider } from "./contexts/ContractTemplatesContext";
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useUserProfile } from './hooks/useUserProfile';

function AppContent() {
  const { profile, loading: profileLoading } = useUserProfile();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white">Carregando perfil...</div>
      </div>
    );
  }

  // Se não tem perfil, mostrar onboarding
  if (!profile) {
    return <UserOnboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <ContractTemplatesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContractTemplatesProvider>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLoginSuccess={() => window.location.reload()} />;
  }

  return <AppContent />;
}

export default App;
