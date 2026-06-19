import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SeedType } from "@/data/seeds";

type Datum = { type: SeedType; total: number };

const TYPE_COLORS: Record<SeedType, string> = {
  Feminized: "#ec4899",
  Regular: "#3b82f6",
  Autoflower: "#84cc16",
  "Unknown Photo": "#94a3b8",
};

const VaultDonut = ({ data }: { data: Datum[] }) => {
  const chartData = useMemo(() => data.filter((entry) => entry.total > 0), [data]);
  const grandTotal = useMemo(() => chartData.reduce((sum, entry) => sum + entry.total, 0), [chartData]);

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground">No seeds to chart.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="type"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
                fontWeight: 700,
              }}
              formatter={(value: number, name) => [`${value} seeds`, name as string]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black leading-none">{grandTotal}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">seeds</span>
        </div>
      </div>

      <div className="grid w-full gap-2">
        {chartData.map((entry) => (
          <div key={entry.type} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[entry.type] }} />
              {entry.type}
            </span>
            <span className="font-black">
              {entry.total}
              <span className="ml-1 text-xs font-semibold text-muted-foreground">
                ({Math.round((entry.total / grandTotal) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultDonut;
