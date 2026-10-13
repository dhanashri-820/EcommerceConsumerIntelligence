import React, { useState } from 'react';
import { Menu, Cpu, LogOut, User as UserIcon, ChevronDown, Settings } from 'lucide-react';
import { PageId } from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPage: PageId;
  onMenuToggle: () => void;
  onNavigateToAccount?: () => void;
  isBackendLive?: boolean;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Overview',
    subtitle: 'Comprehensive analysis of 45,000 balanced customer reviews across Amazon domains'
  },
  trends: {
    title: 'Longitudinal Sentiment Trends',
    subtitle: 'Quarterly satisfaction shifts and timeline tracking from 2019 Q1 through 2023 Q1'
  },
  models: {
    title: 'Machine Learning Model Benchmarking',
    subtitle: 'Comparative evaluation of TF-IDF Logistic Regression, Linear SVM, and fine-tuned DistilBERT'
  },
  aspects: {
    title: 'Aspect-Based Sentiment Analysis & Heatmap',
    subtitle: 'Cross-tabulated opinion heatmap across Quality, Price, Delivery, Durability, Design & Usability'
  },
  complaints: {
    title: 'Voice-of-Customer Complaint Explorer',
    subtitle: 'Root-cause clustering of recurring product friction points with multi-parameter filtering'
  },
  compare: {
    title: 'Product & Domain Comparison',
    subtitle: 'Head-to-head benchmarking of ratings, net sentiment, and aspect advantages'
  },
  upload: {
    title: 'Review Dataset CSV Upload & Batch Analyzer',
    subtitle: 'Server-side validation, duplicate detection, and batch DistilBERT inference on custom spreadsheets'
  },
  predictor: {
    title: 'Live Review Sentiment Analyzer',
    subtitle: 'Real-time multi-model classification and aspect extraction on customer feedback'
  },
  insights: {
    title: 'Consumer Intelligence & Recommendations',
    subtitle: 'Evidence-based engineering, fulfillment, and marketing roadmaps with expected ROI'
  },
  history: {
    title: 'User Analysis History Log',
    subtitle: 'Persistent audit trail of your predictions, batch analyses, and report exports'
  },
  account: {
    title: 'Account Settings & Security',
    subtitle: 'Manage profile information, salted password credentials, and active session protocols'
  }
};

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onMenuToggle, 
  onNavigateToAccount, 
  isBackendLive = false 
}) => {
  const current = PAGE_TITLES[currentPage] || PAGE_TITLES['overview'];
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{current.title}</h2>
          <p className="text-xs text-slate-500 font-normal hidden sm:block mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isBackendLive 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBackendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-semibold">{isBackendLive ? 'FastAPI Connected' : 'Verified Cache'}</span>
        </div>

        {/* Model Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>DistilBERT active</span>
        </div>

        {/* User Account Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-medium text-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                {user.full_name.charAt(0)}
              </div>
              <span className="hidden sm:inline font-semibold text-slate-800 truncate max-w-[100px]">
                {user.full_name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                {onNavigateToAccount && (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onNavigateToAccount();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
