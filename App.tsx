import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PDRPage from './components/PDR/PDRPage';
import Placeholder from './components/Placeholder';
import { ThemeType } from './types';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage, default to 'aurora'
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('ttsp_theme');
    return (saved as ThemeType) || 'aurora';
  });

  // Save theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('ttsp_theme', theme);
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!session) {
      return <LandingPage onAdminLogin={() => setSession({ 
          user: { 
              id: 'local-admin', 
              email: 'admin@ttsp.local', 
              user_metadata: { full_name: 'System Administrator' } 
          } 
      })} />;
  }

  return (
    <Router>
      <Layout currentTheme={theme} setTheme={setTheme} user={session.user}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pdr" element={<PDRPage />} />
          
          {/* Placeholder Routes */}
          <Route path="/projects" element={<Placeholder />} />
          <Route path="/teams" element={<Placeholder />} />
          <Route path="/schedule" element={<Placeholder />} />
          <Route path="/reports" element={<Placeholder />} />
          <Route path="/workload" element={<Placeholder />} />
          <Route path="/archive" element={<Placeholder />} />
          <Route path="/messages" element={<Placeholder />} />
          <Route path="/resources" element={<Placeholder />} />
          <Route path="/support" element={<Placeholder />} />
          <Route path="/settings" element={<Placeholder />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;