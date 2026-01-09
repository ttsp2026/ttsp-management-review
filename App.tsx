import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  // Initialize theme
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('ttsp_theme');
    return (saved as ThemeType) || 'aurora';
  });

  useEffect(() => {
    localStorage.setItem('ttsp_theme', theme);
  }, [theme]);

  // Auth Listener
  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    }).catch(err => {
      console.error("Supabase Error:", err);
      setIsLoading(false); // Stop loading even if error
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DEBUGGING LOADING STATE ---
  if (isLoading) {
      return (
          // We use INLINE STYLES here to ensure visibility even if Tailwind fails
          <div style={{ 
              backgroundColor: '#1e293b', 
              height: '100vh', 
              width: '100vw', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              color: 'white',
              fontSize: '20px'
          }}>
              <div>Loading Application...</div>
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