import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Layers } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, isInitialized, isLoading } = useAuth();

  if (!isInitialized && isLoading) {
    return (
      <div className="h-screen w-screen bg-[#05070d] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-4 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <Layers className="w-6 h-6 text-neon-cyan" />
        </div>
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neon-cyan mb-2">
          AUTHENTICATING SESSION...
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          Verifying HttpOnly credentials with backend
        </div>
      </div>
    );
  }

  if (isInitialized && !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
