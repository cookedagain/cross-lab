import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/hooks/useVaultStore";
import { RotationProvider } from "@/hooks/useRotationStore";
import Index from "./pages/Index";
import StrainDetail from "./pages/StrainDetail";
import Rotation from "./pages/Rotation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VaultProvider>
        <RotationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/strain/:id" element={<StrainDetail />} />
              <Route path="/rotation" element={<Rotation />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RotationProvider>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;