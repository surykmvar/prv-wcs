
import { Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthGuard } from '@/components/AuthGuard'
import { AdminGuard } from '@/components/AdminGuard'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { HelmetProvider } from 'react-helmet-async'
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import NotFound from "./pages/NotFound";
import Feed from './pages/Feed'
import SystemFlow from './pages/SystemFlow'
import PaymentSuccess from './pages/PaymentSuccess'
import ThoughtDetail from './pages/ThoughtDetail'

const queryClient = new QueryClient();

const App = () => {

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="woices-ui-theme">
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/start" element={<Index />} />
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
                <Route path="/thought/:id" element={<ThoughtDetail />} />
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
