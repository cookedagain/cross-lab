import type { Seed, SeedType } from "@/data/seeds";

export type IncomingOrder = {
  id: string;
  label: string;
  supplier: string;
  status: string;
  source?: string;
  orderDate?: string;
  currency?: string;
};

export type IncomingDrop = {
  orderId?: string;
  breeder: string;
  cultivar: string;
  type: "Photoperiod" | "Autoflower" | "Regular" | "Unknown from cart";
  sex: "Feminized" | "Unknown from cart";
  count: number | null;
  quantityPacks: number;
  pack?: string;
  cultivarCount?: number;
  seedsPerCultivar?: number;
  seedsPerPack?: number;
  lineage?: string;
  flowering?: string;
  note?: string;
};

export const INCOMING_ORDERS: IncomingOrder[] = [];

export const DEFAULT_INCOMING_ORDER_ID = "l2t2-multipass";

export const INCOMING_DROPS: IncomingDrop[] = [];

export const getIncomingDropId = (drop: IncomingDrop) =>
  `incoming-v3-${drop.breeder}-${drop.cultivar}`
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const incomingDropToSeed = (drop: IncomingDrop): Seed => {
  const type: SeedType =
    drop.type === "Regular"
      ? "Regular"
      : drop.type === "Autoflower"
        ? "Autoflower"
        : drop.sex === "Feminized"
          ? "Feminized"
          : "Unknown Photo";

  return {
    id: getIncomingDropId(drop),
    name: drop.lineage ? `${drop.cultivar} (${drop.lineage})` : drop.cultivar,
    breeder: drop.breeder === "ETHOS Genetics" ? "Ethos Genetics" : drop.breeder,
    type,
    count: drop.count ?? 0,
  };
};

export const INCOMING_DROP_TOTAL = 0;
export const INCOMING_DROP_UNCONFIRMED_COUNT = 0;
export const INCOMING_DROP_BREEDER_TOTAL = 0;
