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
  {
    id: "7-east-genetics-2026-07-28",
    label: "7 East Genetics Order",
    supplier: "7 East Genetics",
    status: "Ordered / Incoming",
    orderDate: "28 July 2026",
    currency: "CAD",
  },
];

export const DEFAULT_INCOMING_ORDER_ID = "brotanical-2026-07-25";

export const INCOMING_DROPS: IncomingDrop[] = [
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "Pocket Kingz (Cowboyz)",
    type: "Photoperiod",
    sex: "Feminized",
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
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    cultivar: "The R3 Project",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    note: "Minimum confirmed count",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Wrank S1",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Wrank #5 × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "M.C. Nuggets",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Martian Candy OG × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Rocket Queen",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Jet Fuel × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Sprinkles",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Dip n' Stax × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Purple Nasty",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Lemon Cherry Pie × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Dirty Banana",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Wrank Multipack",
    lineage: "Banana Hammock Auto F1 × Wrank #5",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Piña Colada",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "Piña × Banana Hammock",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "My Thai",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "Purple Thai × Banana Hammock",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Banana Split",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "Banana Daddy × Banana Hammock",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Bello y Dulce",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "(Zweet × Piña) × Piña",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Deliziosa",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "(Lilac Diesel × Piña) × Piña",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Piña Pequeña",
    type: "Autoflower",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Tropical Thunder Auto Multipack",
    lineage: "Runtz Auto × Piña",
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
    cultivar: "Cherry Punch × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "8–9 weeks",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Grandpa's Stash × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "8–10 weeks",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "White Wedding × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "9–10 weeks",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Durban Poison × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "Approximately 10 weeks",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Lemon Berry Candy OG × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "Approximately 9 weeks",
  },
  {
    breeder: "Ethos Genetics",
    cultivar: "Mandarin Cookies × Lilac Diesel #22",
    type: "Photoperiod",
    sex: "Feminized",
    count: 5,
    quantityPacks: 1,
    pack: "Lilac Diesel #22 Multipack",
    flowering: "9–10 weeks",
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
    cultivar: "Fuego'Z",
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