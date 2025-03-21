import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Proposals from "./pages/Proposals";
import Templates from "./pages/Templates";
import Finance from "./pages/Finance";
import { LoginForm } from "./components/auth/LoginForm";
import Settings from '@/pages/Settings';
import ProposalView from "./pages/ProposalView";

const queryClient = new QueryClient();

const ProposalRedirect = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop();
  console.log('Redirecionando proposta:', id);
  return <Navigate to={`/p/${id}`} replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-hubster-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas - acessíveis sem login */}
      <Route path="/p/:id" element={<ProposalView />} />
      <Route path="/proposta/:id" element={<ProposalRedirect />} />

      {user ? (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        <>
          <Route path="/login" element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hubster-primary to-hubster-secondary p-4">
              <LoginForm />
            </div>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/proposals" element={<Navigate to="/login" replace />} />
          <Route path="/templates" element={<Navigate to="/login" replace />} />
          <Route path="/finance" element={<Navigate to="/login" replace />} />
          <Route path="/settings" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
