import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { NAV_ITEMS } from '../constants';

const Placeholder: React.FC = () => {
  const location = useLocation();
  const pageName = NAV_ITEMS.find(n => n.path === location.pathname)?.name || 'Page';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in space-y-6">
      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
        <Construction size={40} className="opacity-50" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-2">{pageName}</h1>
        <p className="opacity-60 max-w-md mx-auto">
          This module is currently under development. Check back later for updates or contact the administrator.
        </p>
      </div>

      <div className="flex gap-2">
        <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-mono border border-white/10">v0.1.0-alpha</span>
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono border border-blue-500/30">Coming Soon</span>
      </div>
    </div>
  );
};

export default Placeholder;
