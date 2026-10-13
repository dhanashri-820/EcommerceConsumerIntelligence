import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { SentimentTrends } from './pages/SentimentTrends';
import { ModelComparison } from './pages/ModelComparison';
import { AspectHeatmapView } from './pages/AspectHeatmapView';
import { ComplaintExplorer } from './pages/ComplaintExplorer';
import { ProductComparisonView } from './pages/ProductComparisonView';
import { CsvUploadAnalyzer } from './pages/CsvUploadAnalyzer';
import { LiveReviewAnalyzer } from './pages/LiveReviewAnalyzer';
import { ConsumerIntelligence } from './pages/ConsumerIntelligence';
import { AnalysisHistoryView } from './pages/AnalysisHistoryView';
import { AccountSettings } from './pages/AccountSettings';
import { 
  fetchOverview, 
  fetchModelMetrics, 
  fetchConsumerInsights,
  OverviewData,
  ModelMetricsData,
  ConsumerInsightsData
} from './services/api';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core base data states
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [metricsData, setMetricsData] = useState<ModelMetricsData | null>(null);
  const [insightsData, setInsightsData] = useState<ConsumerInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      try {
        const [overview, metrics, insights] = await Promise.all([
          fetchOverview(),
          fetchModelMetrics(),
          fetchConsumerInsights()
        ]);

        setOverviewData(overview);
        setMetricsData(metrics);
        setInsightsData(insights);

        if (overview.isLive || metrics.isLive) {
          setIsLive(true);
        }
      } catch (err) {
        console.error('Data initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header
          currentPage={currentPage}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigateToAccount={() => setCurrentPage('account')}
          isBackendLive={isLive}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Loading consumer intelligence platform modules...</p>
            </div>
          ) : (
            <>
              {currentPage === 'overview' && overviewData && (
                <ExecutiveOverview data={overviewData} onNavigate={setCurrentPage} />
              )}
              {currentPage === 'trends' && (
                <SentimentTrends />
              )}
              {currentPage === 'models' && metricsData && (
                <ModelComparison data={metricsData} />
              )}
              {currentPage === 'aspects' && (
                <AspectHeatmapView />
              )}
              {currentPage === 'complaints' && (
                <ComplaintExplorer />
              )}
              {currentPage === 'compare' && (
                <ProductComparisonView />
              )}
              {currentPage === 'upload' && (
                <CsvUploadAnalyzer />
              )}
              {currentPage === 'predictor' && (
                <LiveReviewAnalyzer />
              )}
              {currentPage === 'insights' && insightsData && (
                <ConsumerIntelligence data={insightsData} />
              )}
              {currentPage === 'history' && (
                <AnalysisHistoryView />
              )}
              {currentPage === 'account' && (
                <AccountSettings />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <p className="text-sm font-medium text-slate-300">Checking secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <Register onNavigateToLogin={() => setAuthMode('login')} />;
    }
    return <Login onNavigateToRegister={() => setAuthMode('register')} />;
  }

  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
