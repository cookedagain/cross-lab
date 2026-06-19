import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppHeader from "@/components/AppHeader";
import VaultTypeTotals from "@/components/VaultTypeTotals";
import VaultBackup from "@/components/VaultBackup";
import VaultAnalytics from "@/components/VaultAnalytics";
import VaultBreakdown from "@/components/VaultBreakdown";
import BestParents from "@/components/BestParents";
import ExtractionPicks from "@/components/ExtractionPicks";
import MultipassManager from "@/components/MultipassManager";
import BreedingLots from "@/components/BreedingLots";
import CrossPlanner from "@/components/CrossPlanner";
import CrossReport from "@/components/CrossReport";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SEEDS, type Seed } from "@/data/seeds";
import type { TraitGoal } from "@/lib/crossName";

const Index = () => {
  const [parentA, setParentA] = useState<Seed | null>(SEEDS[0] ?? null);
  const [parentB, setParentB] = useState<Seed | null>(SEEDS[1] ?? null);
  const [salt, setSalt] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);

  const toggleGoal = (goal: TraitGoal) =>
    setSelectedGoals((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />

        <main className="container max-w-6xl pb-20 pt-8">
          <VaultTypeTotals />

          <div className="mt-6">
            <VaultBackup />
          </div>

          <VaultAnalytics />
          <VaultBreakdown />
          <BestParents />
          <ExtractionPicks />
          <MultipassManager />
          <BreedingLots />

          <CrossPlanner
            parentA={parentA}
            parentB={parentB}
            onChangeParentA={setParentA}
            onChangeParentB={setParentB}
            selectedGoals={selectedGoals}
            onToggleGoal={toggleGoal}
            onGenerate={() => setSalt((value) => value + 1)}
          />

          <CrossReport parentA={parentA} parentB={parentB} salt={salt} selectedGoals={selectedGoals} />
        </main>

        <MadeWithDyad />
      </div>
    </TooltipProvider>
  );
};

export default Index;