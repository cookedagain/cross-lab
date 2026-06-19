import { estimateExtractionProfile } from "@/lib/extraction";
import type { Seed } from "@/data/seeds";

const Stars = ({ value }: { value: number }) => (
  <span className="font-bold text-foreground">
    {"★".repeat(value)}
    {"☆".repeat(5 - value)}
  </span>
);

const ExtractionPanel = ({ seed, tileClass = "bg-card" }: { seed: Seed; tileClass?: string }) => {
  const e = estimateExtractionProfile(seed);

  const pressability: [string, number][] = [
    ["Flower rosin", e.rosin.flower],
    ["Dry sift rosin", e.rosin.drySift],
    ["Bubble hash rosin", e.rosin.bubbleHash],
    ["Live rosin", e.liveRosin],
    ["Resin", e.resin],
    ["Live resin", e.liveResin],
  ];

  const carts: [string, number][] = [
    ["Rosin cart", e.cart.rosin],
    ["Live rosin cart", e.cart.liveRosin],
    ["Resin cart", e.cart.resin],
    ["Live resin cart", e.cart.liveResin],
  ];

  return (
    <div className="mt-3 border-t border-border/40 pt-2.5">
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
        Extraction & pressability
      </p>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-3">
        {pressability.map(([label, value]) => (
          <div key={label} className={`rounded-lg p-2 ${tileClass}`}>
            <span className="block text-[9px] font-black uppercase text-muted-foreground">{label}</span>
            <Stars value={value} />
          </div>
        ))}
      </div>

      <p className="mb-1.5 mt-2.5 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
        510 cartridge rating
      </p>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold sm:grid-cols-4">
        {carts.map(([label, value]) => (
          <div key={label} className={`rounded-lg p-2 ${tileClass}`}>
            <span className="block text-[9px] font-black uppercase text-muted-foreground">{label}</span>
            <Stars value={value} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractionPanel;