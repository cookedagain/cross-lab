import type { SeedType } from "@/data/seeds";
import { typeShort, typeStyles } from "@/lib/seedDisplay";

export const TypeBadge = ({ type }: { type: SeedType }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${typeStyles[type]}`}>
    {typeShort[type]}
  </span>
);