import React, { useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Database, LayoutDashboard, ArrowRight, Loader2, Lock, X } from 'lucide-react';

interface LandingPageProps {
  onAdminLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAdminLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState(false);

  // Locked for now
  const handleMicrosoftLogin = async () => {
    // setIsLoading(true);
    // try {
    //   const { error } = await supabase.auth.signInWithOAuth({
    //     provider: 'azure',
    //     options: {
    //       scopes: 'email profile openid',
    //       redirectTo: window.location.origin,
    //     },
    //   });
    //   if (error) throw error;
    // } catch (error) {
    //   console.error('Login error:', error);
    //   setIsLoading(false);
    // }
  };

  const verifyAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPass === 'TTSP2026') {
          onAdminLogin();
      } else {
          setAdminError(true);
          setTimeout(() => setAdminError(false), 2000);
      }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-900 flex items-center justify-center font-sans text-slate-100">
      
      {/* Dynamic Background with Subtle Breathing */}
      <div className="absolute inset-0 bg-aurora animate-breathe scale-[1.2]" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Content */}
        <div className="space-y-8 animate-slide-in">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></span>
              ENTERPRISE PORTAL V2.1
           </div>
           
           <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 drop-shadow-sm">
             TTSP <br/> Management <br/> Review
           </h1>
           
           <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
             Centralized Post-Delivery Revision (PDR) analytics, workload tracking, and engineering resource management for the modern shipyard era.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 pt-4 relative">
              
              {/* Outlook Button (Locked) */}
              <div className="relative group">
                  <div className="absolute -top-3 -right-3 z-20 bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                      IN PROGRESS
                  </div>
                  <button 
                    disabled={true}
                    className="w-full sm:w-auto relative px-8 py-4 bg-slate-800 text-slate-500 font-bold rounded-xl border border-white/5 cursor-not-allowed flex items-center justify-center gap-3 opacity-60"
                  >
                    <svg className="w-5 h-5 grayscale opacity-50" viewBox="0 0 21 21" fill="none">
                        <path fill="#f25022" d="M1 1H10V10H1V1Z"/><path fill="#00a4ef" d="M1 11H10V20H1V11Z"/><path fill="#7fba00" d="M11 1H20V10H11V1Z"/><path fill="#ffb900" d="M11 11H20V20H11V11Z"/>
                    </svg>
                    <span>Login with Outlook</span>
                    <Lock size={16} />
                  </button>
              </div>

              {/* Admin Button */}
              <button 
                onClick={() => setShowAdminPrompt(true)}
                className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm active:scale-95 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <ShieldCheck size={18} className="text-blue-300" />
                <span>Admin Access</span>
              </button>
           </div>

           <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/10">
              <div className="space-y-1">
                 <h4 className="text-2xl font-bold text-white">14+</h4>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Modules</p>
              </div>
              <div className="space-y-1">
                 <h4 className="text-2xl font-bold text-white">99.9%</h4>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Uptime</p>
              </div>
              <div className="space-y-1">
                 <h4 className="text-2xl font-bold text-white">Secure</h4>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">Azure AD</p>
              </div>
           </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="hidden lg:block relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-3xl -z-10 rounded-full" />
            
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500 relative z-10 bg-black/40 backdrop-blur-xl">
               <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500" />
                     <div className="w-3 h-3 rounded-full bg-yellow-500" />
                     <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs font-mono text-slate-400">PDR_Analytics_v2.tsx</div>
               </div>
               
               {/* Mock Charts UI */}
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="flex-1 h-32 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-500/20 to-transparent" />
                        <LayoutDashboard className="text-blue-400 opacity-50" size={32} />
                     </div>
                     <div className="flex-1 h-32 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
                        </div>
                        <Database className="text-emerald-400 opacity-50" size={32} />
                     </div>
                  </div>
                  <div className="h-40 rounded-lg bg-white/5 border border-white/5 p-4 space-y-2">
                     <div className="h-2 w-3/4 bg-white/10 rounded" />
                     <div className="h-2 w-1/2 bg-white/10 rounded" />
                     <div className="h-2 w-full bg-white/10 rounded" />
                     <div className="mt-4 flex items-center gap-3">
                        <ShieldCheck className="text-slate-500" size={20} />
                        <span className="text-xs text-slate-500">Secure Context Active</span>
                     </div>
                  </div>
               </div>
            </div>
        </div>

      </div>

      {/* Admin Login Modal */}
      {showAdminPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-sm relative shadow-2xl">
                  <button onClick={() => setShowAdminPrompt(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Lock size={32} />
                      </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-white mb-2">Admin Authorization</h3>
                  <p className="text-sm text-slate-400 text-center mb-6">Enter secure passkey to access the dashboard.</p>
                  
                  <form onSubmit={verifyAdmin} className="space-y-4">
                      <input 
                        type="password" 
                        autoFocus
                        className={`w-full bg-black/20 border ${adminError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="Enter Passkey"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                      />
                      <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                      >
                          Verify & Enter
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default LandingPage;