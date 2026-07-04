import { useMemo } from "react";
import { BarChart3, Gem } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import { useVault } from "@/hooks/useVaultStore";
import { estimateAdvancedMetrics, estimateCannabinoids } from "@/lib/crossName";
import { SEED_TYPES, typeShort } from "@/lib/seedDisplay";
import { getSeedRarity } from "@/lib/rarity";
import { RarityBadge } from "@/components/RarityBadge";
import StrainName from "@/components/StrainName";

const TYPE_COLORS: Record<string, string> = {
  Feminized: "#ec4899",
  Regular: "#3b82f6",
  Autoflower: "#84cc16",
  "Unknown Photo": "#94a3b8",
};

const BREEDER_COLORS = [
  "#16a34a",
  "#7c3aed",
  "#ec4899",
  "#f97316",
  "#0ea5e9",
  "#eab308",
  "#dc2626",
  "#14b8a6",
];

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-2xl font-black">{value}</p>
    {sub && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{sub}</p>}
  </div>
);

const DonutLegend = ({
  entries,
}: {
  entries: { key: string; label: string; value: number; color: string }[];
}) => {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      {entries.map((entry) => (
        <div key={entry.key} className="flex items-center gap-1.5 text-xs font-bold">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.label}</span>
          <span className="text-muted-foreground">
            {entry.value} · {total ? Math.round((entry.value / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
};

const VaultAnalytics = () => {
  const { vaultSeeds, getSeedCount } = useVault();

  const data = useMemo(() => {
    const main = vaultSeeds.filter((seed) => seed.breeder !== "Burn Pile");

    const typeData = SEED_TYPES.map((type) => ({
      name: typeShort[type],
      type,
      seeds: main.filter((seed) => seed.type === type).reduce((sum, seed) => sum + getSeedCount(seed), 0),
    })).filter((entry) => entry.seeds > 0);

    const breederMap = new Map<string, number>();
    for (const seed of main) breederMap.set(seed.breeder, (breederMap.get(seed.breeder) ?? 0) + getSeedCount(seed));
    const breederData = Array.from(breederMap.entries())
      .map(([breeder, seeds]) => ({ name: breeder.replace(/ Genetics| Seed Company| Selections/, ""), seeds }))
      .sort((a, b) => b.seeds - a.seeds)
      .slice(0, 8);

    const thcValues = main.map((seed) => {
      const c = estimateCannabinoids(seed);
      return (c.thc.min + c.thc.max) / 2;
    });
    const avgThc = thcValues.length ? thcValues.reduce((s, v) => s + v, 0) / thcValues.length : 0;

    const flowerValues = main.map((seed) => estimateAdvancedMetrics(seed).floweringWeeks);
    const avgFlower = flowerValues.length ? flowerValues.reduce((s, v) => s + v, 0) / flowerValues.length : 0;

    const totalSeeds = main.reduce((sum, seed) => sum + getSeedCount(seed), 0);

    const mythicalSeeds = main
      .map((seed) => ({ seed, rarity: getSeedRarity(seed) }))
      .filter(({ rarity }) => rarity.tier === "Grail")
      .sort((a, b) => b.rarity.score - a.rarity.score);

    const seedsToHunt = mythicalSeeds.filter(({ seed }) => getSeedCount(seed) <= 3);

    return { typeData, breederData, avgThc, avgFlower, totalSeeds, strains: main.length, seedsToHunt };
  }, [vaultSeeds, getSeedCount]);

  return (
    <CollapsibleSection title="Vault analytics" icon={<BarChart3 className="h-5 w-5" />}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Main-vault strains" value={String(data.strains)} />
        <StatCard label="Main-vault seeds" value={String(data.totalSeeds)} />
        <StatCard label="Avg est. THC" value={`${data.avgThc.toFixed(1)}%`} sub="midpoint across vault" />
        <StatCard label="Avg flowering" value={`${data.avgFlower.toFixed(1)} wks`} sub="estimated" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Seeds by type</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.typeData}
                dataKey="seeds"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.typeData.map((entry) => (
                  <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />
                ))}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
          <DonutLegend
            entries={data.typeData.map((entry) => ({
              key: entry.type,
              label: entry.name,
              value: entry.seeds,
              color: TYPE_COLORS[entry.type],
            }))}
          />
        </div>

        <div className="rounded-3xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Top breeders by seed count</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.breederData}
                dataKey="seeds"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="none"
              >
                {data.breederData.map((entry, index) => (
                  <Cell key={entry.name} fill={BREEDER_COLORS[index % BREEDER_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
          <DonutLegend
            entries={data.breederData.map((entry, index) => ({
              key: entry.name,
              label: entry.name,
              value: entry.seeds,
              color: BREEDER_COLORS[index % BREEDER_COLORS.length],
            }))}
          />
        </div>
      </div>

      {data.seedsToHunt.length > 0 && (
        <div className="mt-5 rounded-3xl border border-border bg-background p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-muted-foreground">
            <Gem className="h-4 w-4 text-fuchsia-500" />
            Mythical Seeds to Hunt
          </p>
          <p className="mb-4 text-sm font-semibold text-muted-foreground">
            These Grail-tier seeds are running low. Consider hunting for more or planning a grow.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.seedsToHunt.map(({ seed, rarity }) => (
              <div key={seed.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex flex-col">
                  <StrainName name={seed.name} className="text-sm font-bold" />
                  <p className="text-xs font-semibold text-muted-foreground">{seed.breeder}</p>
                </div>
                <div className="flex items-center gap-3">
                  <RarityBadge rarity={rarity} />
                  <span className="text-lg font-black text-red-500">{seed.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
};

export default VaultAnalytics;