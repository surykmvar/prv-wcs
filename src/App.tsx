
import { Suspense, useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthGuard } from '@/components/AuthGuard'
import { AdminGuard } from '@/components/AdminGuard'
import { HelmetProvider } from 'react-helmet-async'
import Index from "./pages/Index";
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import NotFound from "./pages/NotFound";
import Feed from './pages/Feed'
import SystemFlow from './pages/SystemFlow'
import PaymentSuccess from './pages/PaymentSuccess'

const queryClient = new QueryClient();

const App = () => {
  // Redirect from lovable.app to custom domain
  useEffect(() => {
    if (window.location.hostname.includes('lovable.app')) {
      window.location.replace(`https://woices.app${window.location.pathname}${window.location.search}${window.location.hash}`);
    }
  }, []);

  // Add noindex for lovable.app domains
  useEffect(() => {
    if (window.location.hostname.includes('lovable.app')) {
      const noindexMeta = document.createElement('meta');
      noindexMeta.name = 'robots';
      noindexMeta.content = 'noindex, nofollow';
      document.head.appendChild(noindexMeta);
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="woices-ui-theme">
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route 
                  path="/auth" 
                  element={
                    <AuthGuard requireAuth={false}>
                      <Auth />
                    </AuthGuard>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <AuthGuard requireAuth={true}>
                      <Profile />
                    </AuthGuard>
                  } 
                />
                <Route path="/admin" element={
                  <AdminGuard>
                    <AdminPanel />
                  </AdminGuard>
                } />
                <Route path="/system-flow" element={
                  <AdminGuard>
                    <SystemFlow />
                  </AdminGuard>
                } />
                <Route path="/feed" element={<Feed />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
