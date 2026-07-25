import type { Seed, SeedType } from "@/data/seeds";

export type IncomingDrop = {
  breeder: string;
  cultivar: string;
  type: string;
  count: number;
  pack?: string;
  lineage?: string;
  flowering?: string;
};

export const INCOMING_DROPS: IncomingDrop[] = [];

export const getIncomingDropId = (drop: IncomingDrop) =>
  `incoming-v3-${drop.breeder}-${drop.cultivar}`
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const incomingDropToSeed = (drop: IncomingDrop): Seed => ({
  id: getIncomingDropId(drop),
  name: drop.lineage ? `${drop.cultivar} (${drop.lineage})` : drop.cultivar,
  breeder: drop.breeder,
  type: (drop.type.includes("Autoflower") ? "Autoflower" : "Feminized") as SeedType,
  count: drop.count,
});

export const INCOMING_DROP_TOTAL = INCOMING_DROPS.reduce((total, drop) => total + drop.count, 0);
export const INCOMING_DROP_BREEDER_TOTAL = new Set(INCOMING_DROPS.map((drop) => drop.breeder)).size;
