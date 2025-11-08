import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@descope/react-sdk';
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import CalendarConnected from "./pages/CalendarConnected";
import GoogleCallback from "./pages/GoogleCallback";
import GooglePopupCallback from "./pages/GooglePopupCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider projectId={import.meta.env.VITE_DESCOPE_PROJECT_ID || 'P3223qYZVJLHP1BYlfXDuKaDtjSk'}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/calendar-connected" element={<CalendarConnected />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/auth/google/popup-callback" element={<GooglePopupCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
