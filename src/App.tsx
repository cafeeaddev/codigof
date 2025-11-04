
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import CodyPresentation from "./pages/CodyPresentation";
import NotFound from "./pages/NotFound";
import FixedBrandLogos from "./components/FixedBrandLogos";
import { SEOHead } from "@/components/SEOHead";
import { Quiz1Host } from "./components/quizzes/quiz1/Quiz1Host";
import { Quiz1Participant } from "./components/quizzes/quiz1/Quiz1Participant";
import { Quiz2Host } from "./components/quizzes/quiz2/Quiz2Host";
import { Quiz2Participant } from "./components/quizzes/quiz2/Quiz2Participant";
import { Quiz3Host } from "./components/quizzes/quiz3/Quiz3Host";
import { Quiz3Participant } from "./components/quizzes/quiz3/Quiz3Participant";

const queryClient = new QueryClient();

const RouteAwareLogos = () => {
  const location = useLocation();
  if (location.pathname === '/admin') return null; // hide on admin only
  return <FixedBrandLogos />;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SEOHead />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cody" element={<CodyPresentation />} />
            {/* Quiz 1 - Mito ou Verdade */}
            <Route path="/quiz/mito-verdade/screen" element={<Quiz1Host />} />
            <Route path="/quiz/mito-verdade" element={<Quiz1Participant />} />
            
            {/* Quiz 2 - Nuvem de Tags */}
            <Route path="/quiz/nuvem-tags/screen" element={<Quiz2Host />} />
            <Route path="/quiz/nuvem-tags" element={<Quiz2Participant />} />
            
            {/* Quiz 3 - Soluções Digitais */}
            <Route path="/quiz/solucoes-digitais/screen" element={<Quiz3Host />} />
            <Route path="/quiz/solucoes-digitais" element={<Quiz3Participant />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Fixed brand logos only on /admin */}
          <RouteAwareLogos />
        </BrowserRouter>
        {/* Removed global FixedBrandLogos to show only on /admin */}
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
