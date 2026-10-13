import React from 'react';
import { 
  BarChart3, 
  Layers, 
  PieChart, 
  Lightbulb, 
  Sparkles, 
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  GitCompare,
  UploadCloud,
  History,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type PageId = 
  | 'overview' 
  | 'trends' 
  | 'models' 
  | 'aspects' 
  | 'complaints' 
  | 'compare' 
  | 'upload' 
  | 'predictor' 
  | 'insights' 
  | 'history' 
  | 'account';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen }) => {
  const { user, logout } = useAuth();

  const navSections: {
    title: string;
    items: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[];
  }[] = [
    {
      title: 'Analytics & Insights',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: <PieChart className="w-4 h-4" /> },
        { id: 'trends', label: 'Sentiment Trends', icon: <TrendingUp className="w-4 h-4" />, badge: 'Timeline' },
        { id: 'models', label: 'Model Benchmarking', icon: <BarChart3 className="w-4 h-4" />, badge: '3 Models' },
        { id: 'aspects', label: 'Aspect Heatmap', icon: <Layers className="w-4 h-4" />, badge: 'ABSA' },
        { id: 'complaints', label: 'Complaint Explorer', icon: <AlertCircle className="w-4 h-4" />, badge: 'VoC' },
        { id: 'compare', label: 'Product Comparison', icon: <GitCompare className="w-4 h-4" /> },
        { id: 'insights', label: 'Consumer Intelligence', icon: <Lightbulb className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Inference Tools',
      items: [
        { id: 'predictor', label: 'Live Review Analyzer', icon: <Sparkles className="w-4 h-4" />, badge: 'Real-Time' },
        { id: 'upload', label: 'CSV Upload & Batch', icon: <UploadCloud className="w-4 h-4" />, badge: 'Batch' },
      ]
    },
    {
      title: 'Account & Security',
      items: [
        { id: 'history', label: 'Analysis History', icon: <History className="w-4 h-4" /> },
        { id: 'account', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 bg-slate-900 border-r border-slate-800 w-64 flex flex-col justify-between text-slate-200 select-none shadow-xl`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              ConsumerIntel
              <span className="text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">ML</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">Ecommerce Intelligence</p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {sec.title}
            </div>
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          active
                            ? 'bg-indigo-700/90 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Session & Logout Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
        {user ? (
          <div className="space-y-2">
            <div 
              onClick={() => onPageChange('account')}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs uppercase">
                {user.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-1">Guest Session</div>
        )}
      </div>
    </aside>
  );
};
