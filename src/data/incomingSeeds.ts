import type { Seed, SeedType } from "@/data/seeds";

export type IncomingSeedType = "Fem photo" | "Fem auto" | "Reg photo" | "Fem photo, triploid";

export type IncomingSeedEntry = {
  cultivar: string;
  breeder: string;
  count: number;
  type: IncomingSeedType;
};

export type IncomingSeedSection = {
  title: string;
  note?: string;
  source: "Multiverse cart" | "Ethos L2T2 Multipass";
  entries: IncomingSeedEntry[];
};

const PRESERVATION_LINE = "Preservation Line";

const incomingSeedTypeMap: Record<IncomingSeedType, SeedType> = {
  "Fem photo": "Feminized",
  "Fem auto": "Autoflower",
  "Reg photo": "Regular",
  "Fem photo, triploid": "Feminized",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getIncomingSeedEntryId = (section: IncomingSeedSection, entry: IncomingSeedEntry) =>
  `incoming-${slugify(section.source)}-${slugify(section.title)}-${slugify(entry.breeder)}-${slugify(entry.cultivar)}`;

export const incomingSeedToSeed = (section: IncomingSeedSection, entry: IncomingSeedEntry): Seed => ({
  id: getIncomingSeedEntryId(section, entry),
  name: entry.cultivar,
  breeder: entry.breeder,
  type: incomingSeedTypeMap[entry.type],
  count: entry.count,
});

export const incomingSeedSections: IncomingSeedSection[] = [
  {
    title: "Gas & Spice 50-seed bundle",
    source: "Multiverse cart",
    note: "Five seeds of each, all feminized photoperiods.",
    entries: [
      { cultivar: "Gorilla Glue S1", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Gorilla Runtz", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Gorilla Candy", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Apple Gas Breath", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Gorilla Sherbert", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Grape Cookie Gas", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Frosted Fiber", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Permanent Marker S1", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Sour Diesel S1", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Oreoz Dream", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
    ],
  },
  {
    title: "Top Sellers Photo Pack 2",
    source: "Multiverse cart",
    note: "Five seeds of each, all feminized photoperiods.",
    entries: [
      { cultivar: "Gelato Scented Marker", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Glue Dream", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Ice Cream Truffle", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Ice Cream Gelato", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Strawberry Banana Kush", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Durban Poison S1", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Gelato Cookie", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Apple Fritter", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Red Runtz", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
      { cultivar: "Gushers", breeder: PRESERVATION_LINE, count: 5, type: "Fem photo" },
    ],
  },
  {
    title: "Tier 1–4 promotional seeds",
    source: "Multiverse cart",
    entries: [
      { cultivar: "Farmer’s Daughter", breeder: "Humboldt Seed Company", count: 3, type: "Fem photo" },
      { cultivar: "Divorce Cake", breeder: "Atlas Seed", count: 3, type: "Fem photo" },
      { cultivar: "Tahoe OG Kush", breeder: "Cali Connection", count: 3, type: "Fem photo" },
      { cultivar: "Gelato Punch", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Gelato Rainbow Sherbert", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Strawberry Cough", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Poddy Mouth", breeder: "Humboldt Seed Company", count: 3, type: "Fem photo" },
      { cultivar: "Gelato 41", breeder: "Atlas Seed", count: 3, type: "Fem photo" },
      { cultivar: "Purple Cherry Sunset", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Blue Dream S1", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Orange Creampop", breeder: "Humboldt Seed Company", count: 3, type: "Fem photo" },
      { cultivar: "Banana Cream Sundae", breeder: "Atlas Seed", count: 3, type: "Fem photo" },
      { cultivar: "Gorilla Gelato", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Fat Cake Breath", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Chicken N’ Wafflez", breeder: "Humboldt Seed Company", count: 3, type: "Fem photo" },
      { cultivar: "Outer Space Cake", breeder: "Atlas Seed", count: 3, type: "Fem photo" },
      { cultivar: "Sour Cherry Diesel", breeder: "Atlas Seed", count: 3, type: "Fem photo" },
      { cultivar: "Tiramisu", breeder: "Cali Connection", count: 3, type: "Fem photo" },
      { cultivar: "Apples and Bananas", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Tropicana Cookies", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
      { cultivar: "Permanent Marker", breeder: PRESERVATION_LINE, count: 3, type: "Fem photo" },
    ],
  },
  {
    title: "Ethos Genetics",
    source: "Multiverse cart",
    note: "Zoap Duet contains five Cherry Zoap R1 and five Sun Dart R1 seeds.",
    entries: [
      { cultivar: "Grape Balls of Fire", breeder: "Ethos Genetics", count: 10, type: "Fem photo" },
      { cultivar: "Planet of the Grapes Auto", breeder: "Ethos Genetics", count: 6, type: "Fem auto" },
      { cultivar: "Peach Crescendo Auto RF3", breeder: "Ethos Genetics", count: 10, type: "Fem auto" },
      { cultivar: "Liqueur R1", breeder: "Ethos Genetics", count: 5, type: "Fem photo" },
      { cultivar: "10th Planet R1", breeder: "Ethos Genetics", count: 5, type: "Fem photo" },
      { cultivar: "Master Kush RBX", breeder: "Ethos Genetics", count: 5, type: "Fem photo" },
      { cultivar: "Cherry Zoap R1", breeder: "Ethos Genetics", count: 5, type: "Fem photo" },
      { cultivar: "Sun Dart R1", breeder: "Ethos Genetics", count: 5, type: "Fem photo" },
      { cultivar: "Pluto Cut × Cookies Auto", breeder: "Ethos Genetics", count: 35, type: "Fem auto" },
    ],
  },
  {
    title: "Humboldt Seed Company",
    source: "Multiverse cart",
    entries: [
      { cultivar: "California Octane Triploid", breeder: "Humboldt Seed Company", count: 5, type: "Fem photo, triploid" },
      { cultivar: "Donutz", breeder: "Humboldt Seed Company", count: 3, type: "Fem photo" },
    ],
  },
  {
    title: "Sin City Seeds",
    source: "Multiverse cart",
    entries: [
      { cultivar: "Strawberry Headband", breeder: "Sin City Seeds", count: 3, type: "Fem photo" },
      { cultivar: "Blue Power IX2", breeder: "Sin City Seeds", count: 3, type: "Fem photo" },
      { cultivar: "Trail Snacks", breeder: "Sin City Seeds", count: 3, type: "Fem photo" },
      { cultivar: "Down Unda Berries", breeder: "Sin City Seeds", count: 3, type: "Fem photo" },
      { cultivar: "Sewer Fruit", breeder: "Sin City Seeds", count: 3, type: "Fem photo" },
      { cultivar: "Extra Baked", breeder: "Sin City Seeds", count: 5, type: "Reg photo" },
    ],
  },
  {
    title: "In House Genetics",
    source: "Multiverse cart",
    entries: [
      { cultivar: "Frozen Grapes", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Gasper", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Sugarcane V2 × Bananacane", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Platinum Terple", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
      { cultivar: "High Voltage", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Da Funk", breeder: "In-House Genetics", count: 3, type: "Fem photo" },
    ],
  },
  {
    title: "Multiverse Genetics value bundle",
    source: "Multiverse cart",
    entries: [
      { cultivar: "Twilight Princess", breeder: "Multiverse Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Banana Blast", breeder: "Multiverse Genetics", count: 3, type: "Fem photo" },
      { cultivar: "Titan 9", breeder: "Multiverse Genetics", count: 3, type: "Fem auto" },
      { cultivar: "Purple Rim", breeder: "Multiverse Genetics", count: 9, type: "Fem photo" },
    ],
  },
  {
    title: "Ethos L2T2 Multipass",
    source: "Ethos L2T2 Multipass",
    note: "Eleven one-seed lines being received.",
    entries: [
      { cultivar: "Chama", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Purple Nasty × Martian Candy OG", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Whiskey OG × Martian Candy OG", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Original “Z” RBX", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Fuego’Z", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Big Fruity", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Lemon Cherry Pie × Original “Z”", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Rainbow Haze", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Rocket Queen × Original “Z”", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Chama × Original “Z”", breeder: "Ethos Genetics", count: 1, type: "Fem photo" },
      { cultivar: "Double Daddy Auto", breeder: "Ethos Genetics", count: 1, type: "Fem auto" },
    ],
  },
];

const sectionTotal = (section: IncomingSeedSection) =>
  section.entries.reduce((sum, entry) => sum + entry.count, 0);

export const incomingSeedSummary = {
  multiverseIdentifiedSeeds: incomingSeedSections
    .filter((section) => section.source === "Multiverse cart")
    .reduce((sum, section) => sum + sectionTotal(section), 0),
  l2t2Seeds: incomingSeedSections
    .filter((section) => section.source === "Ethos L2T2 Multipass")
    .reduce((sum, section) => sum + sectionTotal(section), 0),
  excludedAutoBonusBeans: 10,
};

export const incomingCombinedTotal =
  incomingSeedSummary.multiverseIdentifiedSeeds + incomingSeedSummary.l2t2Seeds;

export const incomingNamedLineTotal = incomingSeedSections.reduce(
  (sum, section) => sum + section.entries.length,
  0,
);

export const getIncomingSectionTotal = sectionTotal;

export const incomingTypeBreakdown = incomingSeedSections
  .flatMap((section) => section.entries)
  .reduce<Record<IncomingSeedType, number>>(
    (totals, entry) => ({ ...totals, [entry.type]: totals[entry.type] + entry.count }),
    {
      "Fem photo": 0,
      "Fem auto": 0,
      "Reg photo": 0,
      "Fem photo, triploid": 0,
    },
  );
