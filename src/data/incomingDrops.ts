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

export const INCOMING_ORDERS: IncomingOrder[] = [
  {
    id: "7-east-genetics-2026-07-28",
    label: "7 East Genetics Order",
    supplier: "7 East Genetics",
    status: "Ordered / Incoming",
    orderDate: "28 July 2026",
    currency: "CAD",
  },
  {
    id: "l2t2-multipass",
    label: "L2T2 Multipass Drop",
    supplier: "ETHOS Genetics",
    source: "L2T2 Multipass",
    status: "Incoming",
  },
];

export const DEFAULT_INCOMING_ORDER_ID = "l2t2-multipass";

export const INCOMING_DROPS: IncomingDrop[] = [
  {
    orderId: "7-east-genetics-2026-07-28",
    breeder: "7 East Genetics",
    cultivar: "Palestinian Princess F2",
    type: "Regular",
    sex: "Unknown from cart",
    count: 15,
    quantityPacks: 1,
    note: "Paid regular-seed product",
  },
  {
    orderId: "7-east-genetics-2026-07-28",
    breeder: "7 East Genetics",
    cultivar: "Lebanese Dragon BX1",
    type: "Regular",
    sex: "Unknown from cart",
    count: 15,
    quantityPacks: 1,
    note: "Paid regular-seed product",
  },
  {
    orderId: "7-east-genetics-2026-07-28",
    breeder: "7 East Genetics",
    cultivar: "Legend of Laos",
    type: "Regular",
    sex: "Unknown from cart",
    count: 15,
    quantityPacks: 1,
    note: "Paid regular-seed product",
  },
  {
    orderId: "7-east-genetics-2026-07-28",
    breeder: "7 East Genetics",
    cultivar: "Blueberry Bastard F4",
    type: "Regular",
    sex: "Unknown from cart",
    count: 15,
    quantityPacks: 1,
    note: "Paid regular-seed product",
  },
  {
    orderId: "7-east-genetics-2026-07-28",
    breeder: "7 East Genetics",
    cultivar: "Purple Dragon Balls F5",
    type: "Regular",
    sex: "Unknown from cart",
    count: 15,
    quantityPacks: 1,
    note: "Paid regular-seed product",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Chama",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Purple Nasty × Martian Candy OG",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Whiskey OG × Martian Candy OG",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Original Z RBX",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Fuego'Z",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Big Fruity",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Lemon Cherry Pie × Original Z",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Rainbow Haze",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Rocket Queen × Original Z",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Chama × Original Z",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Double Daddy Auto",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
];

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

export const INCOMING_DROP_TOTAL = INCOMING_DROPS.reduce(
  (total, drop) => total + (drop.count ?? 0),
  0,
);
export const INCOMING_DROP_UNCONFIRMED_COUNT = INCOMING_DROPS.filter((drop) => drop.count === null).length;
export const INCOMING_DROP_BREEDER_TOTAL = new Set(INCOMING_DROPS.map((drop) => drop.breeder)).size;
