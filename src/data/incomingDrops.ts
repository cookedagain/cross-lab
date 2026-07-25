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

export const INCOMING_ORDERS: IncomingOrder[] = [
  {
    id: "brotanical-2026-07-25",
    label: "Brotanical Gardens Order",
    supplier: "Brotanical Gardens",
    status: "Ordered / Incoming",
    orderDate: "25 July 2026",
    currency: "USD",
  },
  {
    id: "l2t2-multipass",
    label: "L2T2 Multipass Drop",
    supplier: "ETHOS Genetics",
    source: "L2T2 Multipass",
    status: "Incoming",
  },
];

export const DEFAULT_INCOMING_ORDER_ID = "brotanical-2026-07-25";

export const INCOMING_DROPS: IncomingDrop[] = [
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Pocket Kingz (Cowboyz)",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Rainmaker RBx",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Rozé Cookie Dough",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "The R3 Project",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
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
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Chama",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Purple Nasty × Martian Candy OG",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Whiskey OG × Martian Candy OG",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Original Z RBX",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Fuego’Z",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Big Fruity",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Lemon Cherry Pie × Original Z",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Rainbow Haze",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Rocket Queen × Original Z",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Chama × Original Z",
    type: "Unknown from cart",
    sex: "Unknown from cart",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    orderId: "l2t2-multipass",
    breeder: "ETHOS Genetics",
    cultivar: "Double Daddy Auto",
    type: "Autoflower",
    sex: "Unknown from cart",
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
    drop.type === "Autoflower"
      ? "Autoflower"
      : drop.sex === "Feminized"
        ? "Feminized"
        : "Unknown Photo";

  return {
    id: getIncomingDropId(drop),
    name: drop.cultivar,
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
