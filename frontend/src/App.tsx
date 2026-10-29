import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './store/auth';

// Components & Layout
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Overview } from './pages/Overview';
import { Models } from './pages/Models';
import { ABSA } from './pages/ABSA';
import { Insights } from './pages/Insights';
import { Predict } from './pages/Predict';
import { ReviewExplorer } from './pages/ReviewExplorer';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const AppContent: React.FC = () => {
  const { fetchMe } = useAuth();

  // On app mount: restore session from HttpOnly cookie
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes wrapped by ProtectedRoute + Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/models" element={<Models />} />
            <Route path="/absa" element={<ABSA />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/explorer" element={<ReviewExplorer />} />
            <Route path="/predict" element={<Predict />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
