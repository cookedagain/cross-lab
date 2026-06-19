import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useVault } from "@/hooks/useVaultStore";
import { estimateAdvancedMetrics, estimateCannabinoids } from "@/lib/crossName";
import { SEED_TYPES, typeShort } from "@/lib/seedDisplay";

const TYPE_COLORS: Record<string, string> = {
  Feminized: "#ec4899",
  Regular: "#3b82f6",
  Autoflower: "#84cc16",
  "Unknown Photo": "#94a3b8",
};

const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-2xl font-black">{value}</p>
    {sub && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{sub}</p>}
  </div>
);

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

    return { typeData, breederData, avgThc, avgFlower, totalSeeds, strains: main.length };
  }, [vaultSeeds, getSeedCount]);

  return (
    <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-black">Vault analytics</h2>
      </div>

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
            <BarChart data={data.typeData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
              <YAxis tick={{ fontSize: 12 }} width={32} />
              <RTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="seeds" radius={[6, 6, 0, 0]}>
                {data.typeData.map((entry) => (
                  <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Top breeders by seed count</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.breederData} layout="vertical" margin={{ left: 8 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} width={96} />
              <RTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
              <Bar dataKey="seeds" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default VaultAnalytics;