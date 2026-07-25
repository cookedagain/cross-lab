import type { Seed, SeedType } from "@/data/seeds";

export type IncomingOrder = {
  supplier: string;
  status: string;
  orderDate: string;
  currency: string;
};

export type IncomingDrop = {
  breeder: string;
  cultivar: string;
  type: "Photoperiod" | "Autoflower" | "Unknown from cart";
  sex: "Feminized" | "Unknown from cart";
  count: number | null;
  quantityPacks: number;
  pack?: string;
  cultivarCount?: number;
  seedsPerCultivar?: number;
  seedsPerPack?: number;
  note?: string;
};

export const INCOMING_ORDER: IncomingOrder = {
  supplier: "Brotanical Gardens",
  status: "Ordered / Incoming",
  orderDate: "25 July 2026",
  currency: "USD",
};

export const INCOMING_DROPS: IncomingDrop[] = [
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Pocket Kingz (Cowboyz)",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: null,
    quantityPacks: 1,
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Rainmaker RBx",
    type: "Photoperiod",
    sex: "Feminized",
    count: null,
    quantityPacks: 1,
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Rozé Cookie Dough",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: null,
    quantityPacks: 1,
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "The R3 Project",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: null,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Wrank Multipack",
    type: "Photoperiod",
    sex: "Feminized",
    count: 30,
    quantityPacks: 1,
    cultivarCount: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Tropical Thunder Auto Multipack",
    type: "Autoflower",
    sex: "Feminized",
    count: 30,
    quantityPacks: 1,
    cultivarCount: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "10th Planet R1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "GEN 1 Duet",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
    cultivarCount: 2,
    seedsPerCultivar: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Zoap Duet",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
    cultivarCount: 2,
    seedsPerCultivar: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Trop Cherry Duet",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
    cultivarCount: 2,
    seedsPerCultivar: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Pepe Silvia R1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Lilac Diesel #22 Multipack",
    type: "Photoperiod",
    sex: "Feminized",
    count: 30,
    quantityPacks: 1,
    cultivarCount: 5,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Planet of the Grapes Auto",
    type: "Autoflower",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Liqueur R1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Orange Velvet Underground RBx",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
    note: "Retired release",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Mandarin Zkittlez R1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
    note: "Retiring-soon release",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Grape Balls of Fire RBx",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Purple Sunset RBx2",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
  },
  {
    breeder: "In House Genetics",
    cultivar: "Garlic Fusion",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 2,
    pack: "Gold Pack",
    seedsPerPack: 5,
  },
  {
    breeder: "In House Genetics",
    cultivar: "Slurricane #7 S1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 10,
    quantityPacks: 1,
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
    drop.type === "Autoflower"
      ? "Autoflower"
      : drop.sex === "Feminized"
        ? "Feminized"
        : "Unknown Photo";

  return {
    id: getIncomingDropId(drop),
    name: drop.cultivar,
    breeder: drop.breeder,
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
