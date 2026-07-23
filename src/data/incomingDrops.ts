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

export const INCOMING_DROPS: IncomingDrop[] = [
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Pocket Kingz (Cowboyz)", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Rainmaker RBx", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "Rozé Cookie Dough", type: "Feminized", count: 5 },
  { breeder: "Silly Wonka's Golden Beans (Ethos)", cultivar: "The R3 Project", type: "Feminized", count: 3 },

  { breeder: "Ethos Genetics", cultivar: "Wrank S1", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Wrank #5 × Wrank #5" },
  { breeder: "Ethos Genetics", cultivar: "M.C. Nuggets", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Martian Candy OG × Wrank #5" },
  { breeder: "Ethos Genetics", cultivar: "Rocket Queen", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Jet Fuel × Wrank #5" },
  { breeder: "Ethos Genetics", cultivar: "Sprinkles", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Dip n’ Stax × Wrank #5" },
  { breeder: "Ethos Genetics", cultivar: "Purple Nasty", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Lemon Cherry Pie × Wrank #5" },
  { breeder: "Ethos Genetics", cultivar: "Dirty Banana", type: "Feminized", count: 5, pack: "Wrank Multipack", lineage: "Banana Hammock AUTO F1 × Wrank #5" },

  { breeder: "Ethos Genetics", cultivar: "Piña Colada", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "Piña × Banana Hammock" },
  { breeder: "Ethos Genetics", cultivar: "My Thai", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "Purple Thai × Banana Hammock" },
  { breeder: "Ethos Genetics", cultivar: "Banana Split", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "Banana Daddy × Banana Hammock" },
  { breeder: "Ethos Genetics", cultivar: "Bello y Dulce", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "(Zweet × Piña) × Piña" },
  { breeder: "Ethos Genetics", cultivar: "Deliziosa", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "(Lilac Diesel × Piña) × Piña" },
  { breeder: "Ethos Genetics", cultivar: "Piña Pequeña", type: "Feminized Autoflower", count: 5, pack: "Tropical Thunder Auto Multipack", lineage: "Runtz Auto × Piña" },

  { breeder: "Ethos Genetics", cultivar: "10th Planet R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Martian Fuel GEN1", type: "Feminized", count: 5, pack: "GEN 1 Duet", lineage: "Martian Candy OG × Banana Daddy AUTO IBL" },
  { breeder: "Ethos Genetics", cultivar: "Pocket Rocket GEN1", type: "Feminized", count: 5, pack: "GEN 1 Duet", lineage: "Jet Fuel × Banana Daddy AUTO IBL" },
  { breeder: "Ethos Genetics", cultivar: "Cherry Zoap R1", type: "Feminized", count: 5, pack: "Zoap Duet", lineage: "Zoap × Cherry Pie" },
  { breeder: "Ethos Genetics", cultivar: "Sun Dart R1", type: "Feminized", count: 5, pack: "Zoap Duet", lineage: "Zoap × Tahoe OG" },
  { breeder: "Ethos Genetics", cultivar: "Double Cherry Pie R1", type: "Feminized", count: 5, pack: "Trop Cherry Duet", lineage: "Trop Cherry × Cherry Pie" },
  { breeder: "Ethos Genetics", cultivar: "Trop Cherry OG R1", type: "Feminized", count: 5, pack: "Trop Cherry Duet", lineage: "Trop Cherry × SFV OG" },
  { breeder: "Ethos Genetics", cultivar: "Pepe Silvia R1", type: "Feminized", count: 10 },

  { breeder: "Ethos Genetics", cultivar: "Cherry Punch × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "Cherry Punch × Lilac Diesel #22", flowering: "8–9 weeks" },
  { breeder: "Ethos Genetics", cultivar: "Grandpa’s Stash × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "Grandpa’s Stash × Lilac Diesel #22", flowering: "8–10 weeks" },
  { breeder: "Ethos Genetics", cultivar: "White Wedding × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "White Wedding × Lilac Diesel #22", flowering: "9–10 weeks" },
  { breeder: "Ethos Genetics", cultivar: "Durban Poison × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "Durban Poison × Lilac Diesel #22", flowering: "10 weeks" },
  { breeder: "Ethos Genetics", cultivar: "Lemon Berry Candy OG × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "Lemon Berry Candy OG × Lilac Diesel #22", flowering: "9 weeks" },
  { breeder: "Ethos Genetics", cultivar: "Mandarin Cookies × Lilac Diesel #22", type: "Feminized", count: 5, pack: "Lilac Diesel #22 Multipack", lineage: "Mandarin Cookies × Lilac Diesel #22", flowering: "9–10 weeks" },

  { breeder: "Ethos Genetics", cultivar: "Planet Of The Grapes Auto", type: "Feminized Autoflower", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Liqueur R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Orange Velvet Underground RBx", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Mandarin Zkittlez R1", type: "Feminized", count: 10 },
  { breeder: "Ethos Genetics", cultivar: "Grape Balls Of Fire RBx", type: "Feminized", count: 5 },

  { breeder: "In House Genetics", cultivar: "Bananium", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Big Drip", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Garlic Fusion Gold Pack", type: "Feminized", count: 15 },
  { breeder: "In House Genetics", cultivar: "Hot Sauce", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "Magenta OG", type: "Feminized", count: 6 },
  { breeder: "In House Genetics", cultivar: "Platinum Valley", type: "Feminized", count: 5 },
  { breeder: "Da Skreets", cultivar: "Runtz S1", type: "Feminized", count: 5 },
  { breeder: "In House Genetics", cultivar: "PNW Cherries", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Tahoe Snow", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "GASper", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Crystal Cookies V2", type: "Feminized", count: 10 },
  { breeder: "In House Genetics", cultivar: "Frozen Grapes", type: "Feminized", count: 10 },

  { breeder: "Ethos Genetics", cultivar: "Chama", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Purple Nasty × Martian Candy OG", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Whiskey OG × Martian Candy OG", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Original Z RBX", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Fuego'Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Big Fruity", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Lemon Cherry Pie × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Rainbow Haze", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Rocket Queen × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Chama × Original Z", type: "Feminized", count: 5 },
  { breeder: "Ethos Genetics", cultivar: "Double Daddy Auto", type: "Feminized Autoflower", count: 5 },

  { breeder: "Ethos Genetics", cultivar: "Z Cut RBx2", type: "Feminized", count: 5, lineage: "(Z Cut × The Wrank) × Z Cut × Z Cut" },
  { breeder: "Ethos Genetics", cultivar: "Fuego’Z R1", type: "Feminized", count: 5, lineage: "Funky Fuego × Original Z" },
  { breeder: "Ethos Genetics", cultivar: "Atomic Leisure R1", type: "Feminized", count: 5, lineage: "Martian Candy OG × Original Z" },
  { breeder: "Ethos Genetics", cultivar: "Rocket Queen‘Z R1", type: "Feminized", count: 5, lineage: "Rocket Queen × Original Z" },
  { breeder: "Ethos Genetics", cultivar: "Rainbow Pie R1", type: "Feminized", count: 5, lineage: "Lemon Cherry Pie × Original Z" },
  { breeder: "Ethos Genetics", cultivar: "Grape Fruity R1", type: "Feminized", count: 5, lineage: "Little Grapefruit × Original Z" },
];

export const getIncomingDropId = (drop: IncomingDrop) =>
  `incoming-${drop.breeder}-${drop.cultivar}`
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
