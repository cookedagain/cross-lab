import { useMemo, useState } from "react";
import { Dices, FlaskConical, GitBranch, Loader2, Sparkles, Target, Wand2 } from "lucide-react";
import SeedSelect from "@/components/SeedSelect";
import CollapsibleSection from "@/components/CollapsibleSection";
import { TypeBadge } from "@/components/TypeBadge";
import WebLineageLookup from "@/components/WebLineageLookup";
import GeneticsTree from "@/components/GeneticsTree";
import AiKeyForm from "@/components/AiKeyForm";
import { buildCrossLineageTree } from "@/lib/lineageTree";
import { Button } from "@/components/ui/button";
import { useVault } from "@/hooks/useVaultStore";
import { useAiSettings } from "@/hooks/useAiSettings";
import { generateAiCrossNames } from "@/lib/aiFeatures";
import { getKeeperPriority } from "@/lib/keeper";
import {
  TRAIT_GOALS,
  generateCrossNames,
  getCrossReport,
  groupNamesByCategory,
  type CrossName,
  type TraitGoal,
} from "@/lib/crossName";
import type { Seed, SeedType } from "@/data/seeds";

const ToggleChip = ({ goal, active, onClick }: { goal: TraitGoal; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
    }`}
  >
    {goal}
  </button>
);

type SeedTypeAdvice = {
  pollen: string;
  seed: string;
  watch: string;
};

const SEED_TYPE_ADVICE: Record<SeedType, SeedTypeAdvice> = {
  Regular: {
    pollen: "Best pollen path: regular seed stock is the natural donor pool. Hunt for a strong male expression, then only keep donors that match your structure, vigor, aroma-stem, and lineage goals.",
    seed: "Best seed path: use a selected female as the receiver and a selected male as the donor. Expect mixed-sex offspring, which is useful when you want future pollen options.",
    watch: "Watch-outs: space is needed to sex and sort plants; avoid using a male just because it is male.",
  },
  Feminized: {
    pollen: "Best pollen path: fem stock is usually better treated as the seed parent. Feminized pollen requires reversal work, so keep that as an advanced, legal-compliance-only option rather than the default plan.",
    seed: "Best seed path: use the fem as the receiver when you want to preserve or combine a known female line without hunting males from that pack.",
    watch: "Watch-outs: do not spend low-count fem stock casually; preserve-first logic matters unless it is Burn Pile.",
  },
  Autoflower: {
    pollen: "Best pollen path: auto donors need early planning because the clock is fixed. Auto × auto is the cleanest route when the goal is auto offspring.",
    seed: "Best seed path: use autos when speed and compact plants matter. If crossed to photoperiods, expect the auto trait to need later selection before it is reliable.",
    watch: "Watch-outs: less time to evaluate a plant before breeding decisions; keep notes tight and avoid overcommitting rare auto stock.",
  },
  "Unknown Photo": {
    pollen: "Best pollen path: treat unknown-photo stock as unproven until sex is confirmed. It may become a donor, receiver, or cull depending on what it shows.",
    seed: "Best seed path: use only after the plant proves it has a reason to stay in the project.",
    watch: "Watch-outs: unknown sex means unknown workflow; keep expectations loose until the plant declares itself.",
  },
};

const getPairingAdvice = (parentA: Seed, parentB: Seed) => {
  if (parentA.breeder.includes("Burn Pile") || parentB.breeder.includes("Burn Pile")) {
    return "Burn Pile involved: one-and-only run only. Do not plan pollen, seed making, preservation, or breeding work from white-label / potentially mislabelled stock.";
  }
  if (parentA.type === "Regular" || parentB.type === "Regular") {
    return "Regular stock gives the most straightforward path to true male pollen and mixed-sex seed lots.";
  }
  if (parentA.type === "Autoflower" || parentB.type === "Autoflower") {
    return "Auto genetics are best used intentionally: auto × auto for auto-focused work, photo × auto only if you are prepared for later selection.";
  }
  if (parentA.type === "Feminized" && parentB.type === "Feminized") {
    return "Fem × fem is best viewed as female-line combining unless you deliberately choose advanced reversal work.";
  }
  return "Confirm sex and project value before deciding which plant should donate pollen or receive seed.";
};

const getPairingTips = (parentA: Seed, parentB: Seed) => {
  const types = new Set([parentA.type, parentB.type]);
  if (parentA.breeder.includes("Burn Pile") || parentB.breeder.includes("Burn Pile")) {
    return [
      "Treat the Burn Pile plant as a one-and-only run: grow it, evaluate it, consume or discard it, and do not carry it forward.",
      "Do not keep pollen or make seed from it; white-label / potentially mislabelled stock is not reliable enough for your breeding map.",
      "If a non-Burn-Pile parent is valuable, protect that parent and do not spend it on Burn Pile work.",
    ];
  }
  if (types.has("Regular")) {
    return [
      "Use the best selected regular male as the pollen source and a proven female as the receiver; avoid choosing donors on sex alone.",
      "Make a small test lot first when the pollen parent is unproven, then expand only if the offspring justify it.",
      "If both parents are valuable, keep backup seed from each side rather than spending all remaining stock on one cross.",
    ];
  }
  if (types.has("Autoflower")) {
    return [
      "Auto × auto is the cleanest route for auto offspring; photo × auto should be treated as longer-term selection work.",
      "Because autos move fast, decide the goal before pairing: speed, compact size, terpene, or trait preservation.",
      "Keep seed from only the most goal-matching auto expressions, not every quick plant.",
    ];
  }
  if (parentA.type === "Feminized" && parentB.type === "Feminized") {
    return [
      "Choose the stronger keeper as the seed receiver and only use female-derived pollen from a plant worth preserving or combining.",
      "Fem pollen work should stay targeted: one receiver, one clear goal, and careful offspring evaluation.",
      "Avoid using low-count fem lines casually; make backup seed first if the line is rare or highly desired.",
    ];
  }
  return [
    "Confirm sex, quality, and project role before assigning donor or receiver status.",
    "Keep the first seed lot small until the pairing proves it produces worthwhile offspring.",
  ];
};

const CrossPlanner = () => {
  const { seedCounts, vaultSeeds, getSeedCount, seedWithCount } = useVault();
  const { hasKey } = useAiSettings();

  const [parentA, setParentA] = useState<Seed | null>(null);
  const [parentB, setParentB] = useState<Seed | null>(null);
  const [salt, setSalt] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<TraitGoal[]>([]);

  const [aiNames, setAiNames] = useState<CrossName[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showKeyForm, setShowKeyForm] = useState(false);

  const groupedAiNames = useMemo(() => groupNamesByCategory(aiNames), [aiNames]);

  const runAiNames = async () => {
    if (!parentA || !parentB) return;
    if (!hasKey) {
      setShowKeyForm(true);
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const result = await generateAiCrossNames(parentA, parentB, selectedGoals);
      setAiNames(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  const report = useMemo(() => {
    if (!parentA || !parentB) return null;
    return getCrossReport(parentA, parentB, selectedGoals);
  }, [parentA, parentB, selectedGoals]);

  const names = useMemo(() => {
    if (!parentA || !parentB) return [];
    return generateCrossNames(parentA, parentB, salt, selectedGoals);
  }, [parentA, parentB, salt, selectedGoals]);

  const lineageTree = useMemo(() => {
    if (!parentA || !parentB) return null;
    return buildCrossLineageTree(parentA.name, parentB.name);
  }, [parentA, parentB]);

  const groupedNames = useMemo(() => groupNamesByCategory(names), [names]);

  const randomPair = () => {
    const a = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    let b = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    while (b.id === a.id) b = vaultSeeds[Math.floor(Math.random() * vaultSeeds.length)];
    setParentA(a);
    setParentB(b);
    setSalt((value) => value + 1);
  };

  const toggleGoal = (goal: TraitGoal) => {
    setSelectedGoals((current) => (current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]));
  };

  return (
    <>
      <CollapsibleSection title="Cross planner" icon={<Sparkles className="h-5 w-5" />}>
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <SeedSelect label="A" accent="green" value={parentA} onChange={setParentA} onClear={() => setParentA(null)} seeds={vaultSeeds} seedCounts={seedCounts} />
          <div className="grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-xl font-black text-muted-foreground">×</span>
          </div>
          <SeedSelect label="B" accent="purple" value={parentB} onChange={setParentB} onClear={() => setParentB(null)} seeds={vaultSeeds} seedCounts={seedCounts} />
        </div>

        {parentA && parentB && (
          <div className="mt-5 space-y-3 rounded-3xl bg-muted/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[parentA, parentB].map((seed) => (
                <div key={seed.id} className="rounded-2xl bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-display text-lg font-bold leading-tight">{seed.name}</p>
                    <TypeBadge type={seed.type} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {seed.breeder} · {seed.type} · {getSeedCount(seed)} seeds
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-primary">Pollen / seed route advice</p>
              <p className="text-sm font-semibold leading-relaxed">{getPairingAdvice(parentA, parentB)}</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {[parentA, parentB].map((seed) => {
                  const advice = seed.breeder.includes("Burn Pile")
                    ? {
                        ...SEED_TYPE_ADVICE[seed.type],
                        pollen: "Burn Pile route: one-and-only run only. Do not collect pollen or make seeds from white-label / potentially mislabelled stock.",
                        watch: "Watch-outs: evaluate only as personal smoke/test stock; do not use it as breeding evidence or preservation material.",
                      }
                    : SEED_TYPE_ADVICE[seed.type];
                  const countedSeed = seedWithCount(seed);
                  const priority = getKeeperPriority(countedSeed);
                  return (
                    <div key={`${seed.id}-advice`} className="rounded-2xl bg-muted/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="font-display text-base font-bold leading-tight">{seed.name}</p>
                        <TypeBadge type={seed.type} />
                      </div>
                      <div className={`mb-3 rounded-2xl border p-3 ${priority.tone}`}>
                        <p className="text-xs font-black uppercase tracking-wide">{priority.level} keep priority</p>
                        <p className="mt-1 text-xs leading-relaxed">
                          {priority.reasons.length ? priority.reasons.join(" · ") : "standard working stock"}
                        </p>
                      </div>
                      <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                        <p><span className="font-bold text-foreground">Keep seed:</span> {priority.seedPlan}</p>
                        <p><span className="font-bold text-foreground">Keep pollen:</span> {priority.pollenPlan}</p>
                        <p><span className="font-bold text-foreground">Type route:</span> {advice.pollen}</p>
                        <p><span className="font-bold text-foreground">Watch:</span> {advice.watch}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl bg-primary/10 p-4 text-primary">
                <p className="text-xs font-black uppercase tracking-wide">Once pollen + receiver are chosen</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-semibold leading-relaxed">
                  {getPairingTips(parentA, parentB).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-3xl bg-muted/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-black uppercase tracking-wide">Trait goals</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRAIT_GOALS.map((goal) => (
              <ToggleChip key={goal} goal={goal} active={selectedGoals.includes(goal)} onClick={() => toggleGoal(goal)} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button className="h-12 flex-1 rounded-2xl text-base font-bold" onClick={() => setSalt((value) => value + 1)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate names
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl border-2 text-base font-bold" onClick={randomPair}>
            <Dices className="mr-2 h-4 w-4" />
            Random pair
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-2 text-base font-bold"
            onClick={runAiNames}
            disabled={!parentA || !parentB || aiLoading}
          >
            {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            AI name ideas
          </Button>
        </div>

        {showKeyForm && !hasKey && (
          <div className="mt-4">
            <AiKeyForm description="Paste your OpenAI API key to generate AI strain names." />
          </div>
        )}

        {aiError && (
          <p className="mt-4 rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
            {aiError}
          </p>
        )}

        {groupedAiNames.length > 0 && (
          <div className="mt-5 rounded-3xl border-2 border-primary/20 bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-wide text-primary">AI-generated name ideas</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {groupedAiNames.map((group) => (
                <div key={group.category} className="rounded-3xl bg-background p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">{group.category}</p>
                  <div className="space-y-2">
                    {group.names.map((item) => (
                      <div key={item.name} className="rounded-2xl border border-border bg-card p-3">
                        <p className="font-display text-lg font-bold leading-tight">{item.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {report && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border-2 border-primary/20 bg-card p-5 shadow-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cross potential</p>
            <p className="font-display text-5xl font-black text-primary">{report.scores.overall}/100</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.breederNote}</p>
            <div className="mt-5 space-y-3">
              {report.profile.terpenes.map((terpene) => (
                <div key={terpene.key}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span>{terpene.info.name}</span>
                    <span>{terpene.share}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${terpene.share}%`, backgroundColor: terpene.info.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-black">Name ideas</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {groupedNames.map((group) => (
                <div key={group.category} className="rounded-3xl bg-background p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">{group.category}</p>
                  <div className="space-y-2">
                    {group.names.map((item) => (
                      <div key={item.name} className="rounded-2xl border border-border bg-card p-3">
                        <p className="font-display text-lg font-bold leading-tight">{item.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 lg:col-span-2">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Full cross report</p>
              <h2 className="font-display text-2xl font-black tracking-tight">{parentA?.name} × {parentB?.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{report.profile.summary}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl bg-background p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Score breakdown</p>
                <div className="space-y-2">
                  {[
                    ["Flavor synergy", report.scores.flavorSynergy],
                    ["Terpene contrast", report.scores.terpeneContrast],
                    ["Breeder interest", report.scores.breederInterest],
                    ["Name potential", report.scores.namePotential],
                    ["Goal match", report.scores.goalMatch],
                  ].map(([label, score]) => (
                    <div key={label as string}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span>{label}</span>
                        <span>{score}/100</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-background p-4 lg:col-span-2">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Phenotype preview</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {report.phenotypes.map((pheno) => (
                    <div key={pheno.title} className="rounded-2xl border border-border bg-card p-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
                        {pheno.likelihood}
                      </span>
                      <p className="mt-2 font-display text-base font-bold leading-tight">{pheno.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pheno.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {lineageTree && (
                <div className="rounded-3xl bg-background p-4 lg:col-span-3">
                  <div className="mb-3 flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Genetics tree</p>
                  </div>
                  <GeneticsTree root={lineageTree} />
                </div>
              )}

              <div className="rounded-3xl bg-background p-4 lg:col-span-3">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Cross size / dry-yield estimates</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {report.growthEstimates.map((estimate) => {
                    const gear = estimate.wattage === "<100W" ? "Vivosun VGrow smart box" : estimate.wattage === "220W" ? "AC Infinity 2×2" : "AC Infinity 4×4";
                    return (
                      <div key={estimate.wattage} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-primary">{estimate.wattage}</p>
                            <p className="text-xs font-bold text-muted-foreground">{gear}</p>
                          </div>
                          <p className="font-display text-xl font-black">{estimate.yieldG.min}–{estimate.yieldG.max}g</p>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground">
                          <span>H: {estimate.heightCm.min}–{estimate.heightCm.max}cm</span>
                          <span>W: {estimate.widthCm.min}–{estimate.widthCm.max}cm</span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{estimate.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl bg-background p-4 lg:col-span-2">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Genetic notes</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {report.geneticNotes.map((note) => (
                    <div key={note.label} className="rounded-2xl border border-border bg-card p-3">
                      <p className="font-bold">{note.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-background p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Lineage map</p>
                <div className="space-y-3">
                  {report.lineage.map((node) => (
                    <div key={node.parent} className="rounded-2xl border border-border bg-card p-3">
                      <p className="text-[10px] font-black uppercase text-primary">Parent {node.parent}</p>
                      <p className="mt-1 font-display text-base font-bold leading-tight">{node.name}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{node.breeder}</p>
                      {node.pieces.length > 0 && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{node.pieces.join(" × ")}</p>
                      )}
                      <WebLineageLookup name={node.name} breeder={node.breeder} compact />
                      {node.flags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {node.flags.map((flag) => (
                            <span key={flag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default CrossPlanner;