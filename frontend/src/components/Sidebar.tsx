import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Compass,
  MessageSquareQuote,
  Zap,
  LogOut,
  Layers,
  ChevronRight,
  ShieldCheck,
  Database,
  FileCode2,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { ModelCardModal } from './ModelCardModal';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/models', label: 'Model Benchmarks', icon: Cpu },
    { to: '/absa', label: 'Aspect Radar', icon: Compass },
    { to: '/insights', label: 'Voice of Customer', icon: MessageSquareQuote },
    { to: '/explorer', label: 'Review Explorer', icon: Database },
    { to: '/predict', label: 'Live Predictor', icon: Zap },
  ];

  return (
    <aside className="w-64 h-screen bg-[#05070d]/90 border-r border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between shrink-0 select-none z-30">
      {/* Top brand header */}
      <div>
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-violet/30 border border-neon-cyan/40 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Layers className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Consumer</span>
                <span className="text-neon-cyan font-mono">IQ</span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                OPS COMMAND CENTER
              </div>
            </div>
          </div>

          {/* Live System Indicator */}
          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-lime opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-lime shadow-[0_0_8px_#a3e635]" />
              </span>
              <span className="text-[10px] font-mono text-slate-300 font-medium">
                SYSTEM LIVE
              </span>
            </div>
            <span className="text-[9px] font-mono text-neon-cyan/80">
              :8000
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-white/[0.08] text-white border-l-2 border-neon-cyan shadow-[0_0_20px_rgba(34,211,238,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-neon-cyan'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-neon-cyan" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model Card Trigger & User footer */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <button
          onClick={() => setIsModelCardOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-neon-violet/10 hover:bg-neon-violet/20 border border-neon-violet/25 text-violet-300 text-xs font-mono transition-colors group"
        >
          <div className="flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5 text-neon-violet group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Model Card</span>
          </div>
          <span className="text-[10px] text-slate-400 group-hover:text-violet-200">
            DistilBERT ↗
          </span>
        </button>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neon-violet/20 border border-neon-violet/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-neon-violet" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                {user?.email || 'admin@consumeriq.io'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-neon-red hover:bg-neon-red/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ModelCardModal
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
      />
    </aside>
  );
};
