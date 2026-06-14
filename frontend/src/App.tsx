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
import IntegrationsPage from './pages/IntegrationsPage';
import ExecutionDetailPage from './pages/ExecutionDetailPage';

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
          <Route path="/executions/:executionId" element={<ProtectedRoute><AppLayout><ExecutionDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><AppLayout><IntegrationsPage /></AppLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
