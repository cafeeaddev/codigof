
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
import { Quiz4Host } from "./components/quizzes/quiz4/Quiz4Host";
import { Quiz4Participant } from "./components/quizzes/quiz4/Quiz4Participant";
import { Quiz5Host } from "./components/quizzes/quiz5/Quiz5Host";
import { Quiz5Participant } from "./components/quizzes/quiz5/Quiz5Participant";
import { FritarOvoHost } from "./components/quizzes/fritar-ovo/FritarOvoHost";
import { FritarOvoParticipant } from "./components/quizzes/fritar-ovo/FritarOvoParticipant";
import { FluxoClienteHost } from "./components/quizzes/fluxo-cliente/FluxoClienteHost";
import { FluxoClienteParticipant } from "./components/quizzes/fluxo-cliente/FluxoClienteParticipant";
import { PseudoCodigoHost } from "./components/quizzes/pseudo-codigo/PseudoCodigoHost";
import { PseudoCodigoParticipant } from "./components/quizzes/pseudo-codigo/PseudoCodigoParticipant";
import { LogicaAplicadaHost } from "./components/quizzes/logica-aplicada/LogicaAplicadaHost";
import { LogicaAplicadaParticipant } from "./components/quizzes/logica-aplicada/LogicaAplicadaParticipant";
import FluxogramaOvo from "./pages/FluxogramaOvo";
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
            
            {/* Quiz 4 - Canvas Colaborativo */}
            <Route path="/quiz/canvas/screen" element={<Quiz4Host />} />
            <Route path="/quiz/canvas" element={<Quiz4Participant />} />
            
            {/* Quiz 5 - Mapa da Alfabetização Tecnológica */}
            <Route path="/quiz/mapa/screen" element={<Quiz5Host />} />
            <Route path="/quiz/mapa" element={<Quiz5Participant />} />
            
            {/* Treinamento 2 - Missão Fritar um OVO */}
            <Route path="/quiz/fritar-ovo/screen" element={<FritarOvoHost />} />
            <Route path="/quiz/fritar-ovo" element={<FritarOvoParticipant />} />
            
            {/* Treinamento 2 - Fluxo do Cliente */}
            <Route path="/quiz/fluxo-cliente/screen" element={<FluxoClienteHost />} />
            <Route path="/quiz/fluxo-cliente" element={<FluxoClienteParticipant />} />
            
            {/* Treinamento 2 - Pseudo-código */}
            <Route path="/quiz/pseudo-codigo/screen" element={<PseudoCodigoHost />} />
            <Route path="/quiz/pseudo-codigo/play" element={<PseudoCodigoParticipant />} />
            
            {/* Treinamento 2 - Quiz Lógica Aplicada */}
            <Route path="/quiz/logica-aplicada/screen" element={<LogicaAplicadaHost />} />
            <Route path="/quiz/logica-aplicada" element={<LogicaAplicadaParticipant />} />
            
            {/* Fluxograma do Ovo - Slide visual */}
            <Route path="/fluxograma-ovo" element={<FluxogramaOvo />} />
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
