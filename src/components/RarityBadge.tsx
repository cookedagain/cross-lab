import { Gem } from "lucide-react";
import type { SeedRarity } from "@/lib/rarity";

export const RarityBadge = ({ rarity }: { rarity: SeedRarity }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${rarity.tone}`}>
    <Gem className="h-3 w-3" />
    {rarity.tier}
  </span>
);
