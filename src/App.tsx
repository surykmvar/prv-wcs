
import { Suspense } from 'react'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthGuard } from '@/components/AuthGuard'
import { HelmetProvider } from 'react-helmet-async'
import Index from "./pages/Index";
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import NotFound from "./pages/NotFound";
import Feed from './pages/Feed'
import SystemFlow from './pages/SystemFlow'

const queryClient = new QueryClient();

const App = () => (
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
                  <AuthGuard requireAuth={true}>
                    <AdminPanel />
                  </AuthGuard>
                } />
                <Route path="/system-flow" element={<SystemFlow />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
