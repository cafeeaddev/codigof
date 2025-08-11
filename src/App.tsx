
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removido: import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import CreateAdmin from "./pages/CreateAdmin";
import GameSummary from "./pages/GameSummary";
import NotFound from "./pages/NotFound";
import FixedBrandLogos from "./components/FixedBrandLogos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/final" element={<GameSummary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <FixedBrandLogos />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
