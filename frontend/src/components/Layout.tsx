import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, Activity, Server } from 'lucide-react';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#05070d]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Area Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-white/[0.06] bg-[#05070d]/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
              <span className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase">
                CONSUMER IQ / INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <Server className="w-3.5 h-3.5 text-neon-violet" />
              <span>FastAPI · 127.0.0.1:8000</span>
            </div>
            <div className="flex items-center gap-1.5 text-neon-lime">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
