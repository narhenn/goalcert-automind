import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TemplatesPage from './pages/TemplatesPage';
import AgentDetailPage from './pages/AgentDetailPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><AppLayout><TemplatesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/agents/:id" element={<ProtectedRoute><AppLayout><AgentDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/agents/:id/builder" element={<ProtectedRoute><WorkflowBuilderPage /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><AppLayout><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><h1 className="text-2xl font-bold text-slate-900 mb-2">Integrations</h1><p className="text-sm text-slate-500">Coming soon</p></div></AppLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
