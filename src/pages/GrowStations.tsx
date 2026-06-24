import { Link } from "react-router-dom";
import { ArrowLeft, Boxes, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CloneRegister from "@/components/CloneRegister";
import BestParents from "@/components/BestParents";
import RecommendedCrosses from "@/components/RecommendedCrosses";
import BreedingLots from "@/components/BreedingLots";
import CrossPlanner from "@/components/CrossPlanner";
import GrowCostCalculator from "@/components/GrowCostCalculator";
import StationManager from "@/components/StationManager";
import { CloneRegisterProvider } from "@/hooks/useCloneRegister";
import { StationProvider } from "@/hooks/useStationStore";
import { Button } from "@/components/ui/button";

const GrowStations = () => {
  return (
    <CloneRegisterProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border/70 bg-card/90 backdrop-blur">
          <div className="container flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Boxes className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-black tracking-tight">Growing</p>
                <p className="text-sm text-muted-foreground">Equipment, clone register & breeding tools</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Seed vault
              </Link>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-2xl border-2"
                onClick={() => window.location.reload()}
                title="Refresh page"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl pb-20 pt-8">
          <StationProvider>
            <StationManager />
          </StationProvider>

          <CloneRegister />

          <GrowCostCalculator />

          <BestParents />

          <RecommendedCrosses />

          <BreedingLots />

          <CrossPlanner />

          <div className="mt-6 rounded-3xl bg-muted/50 p-4 text-xs font-semibold leading-relaxed text-muted-foreground">
            Add each grow space you run so the seed picks and breeding tools can tailor estimates to your real
            setup — and always trust your EC/pH meter over any chart.
          </div>
        </main>
      </div>
    </CloneRegisterProvider>
  );
};

export default GrowStations;