import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VaultProvider } from "@/hooks/useVaultStore";
import { RotationProvider } from "@/hooks/useRotationStore";
import CultivarDataSync from "@/components/CultivarDataSync";
import Index from "./pages/Index";
import StrainDetail from "./pages/StrainDetail";
import Rotation from "./pages/Rotation";
import Breeders from "./pages/Breeders";
import BreederDetail from "./pages/BreederDetail";
import GrowStations from "./pages/GrowStations";
import Integrations from "./pages/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VaultProvider>
        <CultivarDataSync>
          <RotationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/strain/:id" element={<StrainDetail />} />
                <Route path="/rotation" element={<Rotation />} />
                <Route path="/breeders" element={<Breeders />} />
                <Route path="/breeders/:breeder" element={<BreederDetail />} />
                <Route path="/stations" element={<GrowStations />} />
                <Route path="/integrations" element={<Integrations />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </RotationProvider>
        </CultivarDataSync>
      </VaultProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;