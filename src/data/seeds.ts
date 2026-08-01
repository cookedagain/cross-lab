export type SeedType = "Feminized" | "Regular" | "Autoflower" | "Unknown Photo";

export type Seed = {
  id: string;
  name: string;
  breeder: string;
  type: SeedType;
  count?: number;
  note?: string;
};

type SeedEntry = {
  name: string;
  count: number;
  type: SeedType;
  note?: string;
};

const raw: { breeder: string; seeds: SeedEntry[] }[] = [
  {
    breeder: "Ethos Genetics",
    seeds: [
      { name: "End Game #3 × Grandpa's Cookies #10", count: 3, type: "Feminized" },
      { name: "Durban Poison × Lilac Diesel #22", count: 11, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: Approximately 10 weeks" },
      { name: "Uber Cherry", count: 3, type: "Feminized" },
      { name: "Temple Kush F2 × Temple of the Dog BX", count: 9, type: "Regular" },
      { name: "Temple Kush F2 × California Black Rozé #10", count: 9, type: "Regular" },
      { name: "Quattro Kush F3 × OG Kush BX3", count: 10, type: "Regular" },
      { name: "CrescendØ #2 × Marshmallow OG", count: 5, type: "Feminized" },
      { name: "Quattro Kush F3 × Zweet Inzanity", count: 10, type: "Regular" },
      { name: "Temple Kush F2 × Mandarin Cookies R2 #7", count: 10, type: "Regular" },
      { name: "Quattro Kush F3", count: 10, type: "Regular" },
      { name: "Cherry TK F2", count: 5, type: "Regular" },
      { name: "Grandpa's Cookies × End Game #5", count: 5, type: "Feminized" },
      { name: "Quattro Kush F3 × Sour Diesel BX3", count: 10, type: "Regular" },
      { name: "End Game #5 S1", count: 5, type: "Feminized" },
      { name: "Grape Diamonds × Lilac Diesel BX3", count: 8, type: "Feminized" },
      { name: "Grape Diamonds × End Game #5", count: 5, type: "Feminized" },
      { name: "Quattro Kush F3 × Granddaddy Purple", count: 10, type: "Regular" },
      { name: "Temple Kush F2 × Zkittlez BX1", count: 10, type: "Regular" },
      { name: "Fruity Pebbles OG × Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "Lemon Cherry Gelato × SVF OG", count: 3, type: "Feminized" },
      { name: "CrescendØ #2 × Cherry Pie", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × Blueberry Muffin Bubba", count: 10, type: "Regular" },
      { name: "Granddaddy Purple × Quattro Kush", count: 3, type: "Regular" },
      { name: "Permanent Marker × OG Kush BX4", count: 3, type: "Regular" },
      { name: "Blueberry Cookies × MCV3", count: 3, type: "Feminized" },
      { name: "Tropical Cherry × Marshmallow OG", count: 3, type: "Feminized" },
      { name: "White Wedding × Zweet OG", count: 3, type: "Feminized" },
      { name: "All the Sauces R1", count: 5, type: "Feminized" },
      { name: "CrescendØ #2 × End Game #3", count: 5, type: "Feminized" },
      { name: "Wrank × End Game", count: 5, type: "Feminized" },
      { name: "Spanish Moon × Grandpa's Stash #12", count: 5, type: "Feminized" },
      { name: "Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "Temple Kush F2 × Peach CrescendØ #2", count: 10, type: "Regular" },
      { name: "Peach CrescendØ F1 × Grandpa's Stash #12", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × Purple Zkittlez", count: 10, type: "Regular" },
      { name: "Punch Line RBX × Grandpa's Stash #12", count: 5, type: "Regular" },
      { name: "Purple Sunset × Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "Quattro Kush F3 × Purple Majik #10", count: 10, type: "Regular" },
      { name: "Apples & Bananas Auto", count: 4, type: "Autoflower" },
      { name: "CrescendØ #16 × SVF OG", count: 5, type: "Feminized" },
      { name: "Super Lemon Haze × Zweet Auto", count: 3, type: "Autoflower" },
      { name: "CrescendØ #2 × End Game #5", count: 5, type: "Feminized" },
      { name: "Temple Kush F3", count: 10, type: "Regular" },
      { name: "GMO Cookies × Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "Grandpa's Stash #6 × End Game #5", count: 5, type: "Feminized" },
      { name: "10th Planet × Grandpa's Stash #12", count: 5, type: "Feminized" },
      { name: "XXX #20 × End Game #5", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × CrescendØ #16", count: 10, type: "Regular" },
      { name: "Temple Kush F2", count: 10, type: "Regular" },
      { name: "NYCD × Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "End Game R2 × Grandpa's Stash #12", count: 5, type: "Feminized" },
      { name: "High Note R1", count: 3, type: "Feminized" },
      { name: "Temple Kush F2 × Heirloom Purple", count: 10, type: "Regular" },
      { name: "Banana RF7 Auto", count: 3, type: "Autoflower" },
      { name: "CrescendØ #6 × Lilac Diesel BX3", count: 10, type: "Regular" },
      { name: "Pina #5 × Zweet Auto", count: 3, type: "Autoflower" },
      { name: "Quattro Kush F3 × Lilac Diesel", count: 10, type: "Regular" },
      { name: "CrescendØ #2 × SVF OG", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × Wedding Cake", count: 10, type: "Regular" },
      { name: "CrescendØ #16 × Tahoe OG", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × CrescendØ #6", count: 10, type: "Regular" },
      { name: "Original CrescendØ × Grandpa's Stash #12", count: 5, type: "Feminized" },
      { name: "Temple Kush F2 × OG D Lux", count: 10, type: "Regular" },
      { name: "Lilac Diesel Auto × Zweet Auto", count: 4, type: "Autoflower" },
      { name: "Banana Hammock × Lilac Diesel #22", count: 4, type: "Feminized" },
      { name: "Jealousy × Banana Daddy Auto", count: 2, type: "Autoflower" },
      { name: "Josh D OG BX3", count: 20, type: "Regular" },
      { name: "Krux × Grandpa's Cookies #6", count: 2, type: "Feminized" },
      { name: "Grape Diamonds × Grandpa's Cookies #6", count: 2, type: "Feminized" },
      { name: "Grandpa's Cookies #3 × Josh D OG BX3", count: 20, type: "Regular" },
      { name: "Lilac Diesel × Pineapple Runtz Auto", count: 2, type: "Autoflower" },
      { name: "Cap Junkie × End Game #3", count: 9, type: "Feminized" },
      { name: "Blueberry Cookies", count: 2, type: "Feminized" },
      { name: "Wrotten Fruit", count: 10, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "Auto V5 × Homogenous", count: 4, type: "Autoflower", note: "Note: Brotanical Gardens arrival" },
      { name: "Skunk Hero × Oaksterdam OG", count: 4, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "Full Throttle Wedding", count: 8, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "CrescendØ #16 × Grandpa's Cookies #10", count: 6, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "Wrank S1", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Wrank #5 × Wrank #5" },
      { name: "M.C. Nuggets", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Martian Candy OG × Wrank #5" },
      { name: "Rocket Queen", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Jet Fuel × Wrank #5" },
      { name: "Sprinkles", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Dip n' Stax × Wrank #5" },
      { name: "Purple Nasty", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Lemon Cherry Pie × Wrank #5" },
      { name: "Dirty Banana", count: 5, type: "Feminized", note: "Pack: Wrank Multipack | Lineage: Banana Hammock Auto F1 × Wrank #5" },
      { name: "Cherry Punch × Lilac Diesel #22", count: 5, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: 8–9 weeks" },
      { name: "Grandpa's Stash × Lilac Diesel #22", count: 5, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: 8–10 weeks" },
      { name: "White Wedding × Lilac Diesel #22", count: 5, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: 9–10 weeks" },
      { name: "Lemon Berry Candy OG × Lilac Diesel #22", count: 5, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: Approximately 9 weeks" },
      { name: "Mandarin Cookies × Lilac Diesel #22", count: 5, type: "Feminized", note: "Pack: Lilac Diesel #22 Multipack | Flowering: 9–10 weeks" },
      { name: "Piña Colada", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: Piña × Banana Hammock" },
      { name: "My Thai", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: Purple Thai × Banana Hammock" },
      { name: "Banana Split", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: Banana Daddy × Banana Hammock" },
      { name: "Bello y Dulce", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: (Zweet × Piña) × Piña" },
      { name: "Deliziosa", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: (Lilac Diesel × Piña) × Piña" },
      { name: "Piña Pequeña", count: 5, type: "Autoflower", note: "Pack: Tropical Thunder Auto Multipack | Lineage: Runtz Auto × Piña" },
      { name: "Trop Cherry Duet", count: 10, type: "Feminized", note: "Cultivars in listing: 2 | Seeds per cultivar: 5" },
      { name: "10th Planet R1", count: 10, type: "Feminized" },
      { name: "Pepe Silvia R1", count: 10, type: "Feminized" },
      { name: "Liqueur R1", count: 10, type: "Feminized" },
      { name: "Orange Velvet Underground RBx", count: 10, type: "Feminized", note: "Note: Retired release" },
      { name: "GEN 1 Duet", count: 10, type: "Feminized", note: "Cultivars in listing: 2 | Seeds per cultivar: 5" },
      { name: "Purple Sunset RBx2", count: 10, type: "Feminized" },
      { name: "Grape Balls of Fire RBx", count: 5, type: "Feminized" },
      { name: "Zoap Duet", count: 10, type: "Feminized", note: "Cultivars in listing: 2 | Seeds per cultivar: 5" },
      { name: "Planet of the Grapes Auto", count: 10, type: "Autoflower" },
      { name: "Mandarin Zkittlez R1", count: 10, type: "Feminized", note: "Note: Retiring-soon release" },
    ],
  },
  {
    breeder: "Binchickens Genetics",
    seeds: [
      { name: "Banksia Tar Kush F2 #9", count: 20, type: "Regular" },
      { name: "Banksia Tar Kush F2 #14", count: 17, type: "Regular" },
      { name: "Banksia Tar Kush F2 #6", count: 35, type: "Regular" },
      { name: "Banksia Tar Kush V1", count: 25, type: "Regular" },
      { name: "Dog Downunder ABC", count: 18, type: "Regular" },
      { name: "Wombat Breath ABC", count: 16, type: "Regular" },
      { name: "Deep Chunk", count: 23, type: "Regular" },
      { name: "Ol Betsy × Chem91 × Deep Chunk", count: 17, type: "Regular" },
    ],
  },
  {
    breeder: "Terpyz Mutant Genetics",
    seeds: [
      { name: "Mentha de Croco", count: 12, type: "Regular" },
      { name: "Quackberry Rose", count: 12, type: "Regular" },
      { name: "Bubblegum GPP", count: 6, type: "Regular" },
      { name: "Feral Fuel ABC", count: 13, type: "Regular" },
    ],
  },
  {
    breeder: "Black Leaf Genetics",
    seeds: [
      { name: "Frozen Baller", count: 2, type: "Feminized" },
      { name: "Yeti Blast", count: 2, type: "Feminized" },
      { name: "Hash Bar", count: 2, type: "Feminized" },
      { name: "Pink Nectar", count: 2, type: "Feminized" },
      { name: "Ice Rock Candy", count: 2, type: "Feminized" },
      { name: "Frozen Bag S1", count: 3, type: "Feminized" },
    ],
  },
  {
    breeder: "Humboldt Seed Company",
    seeds: [
      { name: "Garlic Budder", count: 5, type: "Feminized" },
      { name: "Sapphire OG", count: 5, type: "Feminized" },
      { name: "Gorilla Breath", count: 1, type: "Feminized" },
      { name: "Sugar Breath", count: 1, type: "Feminized" },
    ],
  },
  {
    breeder: "In-House Genetics",
    seeds: [
      { name: "Random Platinum Cross", count: 4, type: "Regular" },
      { name: "Slurricane #44 RBX", count: 3, type: "Feminized" },
      { name: "GG #4 × Black Cherry Smoothie", count: 3, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "Zofire", count: 6, type: "Feminized", note: "Note: Brotanical Gardens arrival" },
      { name: "Garlic Fusion", count: 12, type: "Feminized", note: "Note: Physical count; 2 Gold Packs" },
      { name: "Slurricane #7 S1", count: 12, type: "Feminized", note: "Note: Physical count" },
    ],
  },
  {
    breeder: "WolfPack Selections",
    seeds: [
      { name: "Fruit Funk (GMO × Guava Biscotti)", count: 6, type: "Feminized" },
    ],
  },
  {
    breeder: "Happy Valley Genetics",
    seeds: [
      { name: "Game Over", count: 10, type: "Feminized" },
      { name: "End Game #3 S1", count: 6, type: "Feminized" },
    ],
  },
  {
    breeder: "Brothers Grimm",
    seeds: [
      { name: "Bubble's Blueberry F4", count: 18, type: "Feminized" },
      { name: "Ricky's Hash Plant", count: 20, type: "Feminized" },
      { name: "Julian's Black Tee Tangie", count: 20, type: "Feminized" },
    ],
  },
  {
    breeder: "Greenspace AU",
    seeds: [
      { name: "Heavy Bud", count: 5, type: "Feminized" },
      { name: "Super Bud", count: 5, type: "Feminized" },
      { name: "Exodus Cheese", count: 5, type: "Feminized" },
      { name: "Mango Smile Auto", count: 3, type: "Autoflower" },
    ],
  },
  {
    breeder: "7 East Genetics",
    seeds: [
      { name: "Freaks of Dank", count: 20, type: "Regular" },
    ],
  },
  {
    breeder: "G13 Labs",
    seeds: [
      { name: "Cheeselicious", count: 3, type: "Feminized", note: "Note: Breeder unknown; catalogued under the G13 Labs banner" },
      { name: "Pineapple Express × Runtz 13", count: 3, type: "Feminized", note: "Note: Bred by Greenspace AU; catalogued under the G13 Labs banner" },
    ],
  },
  {
    breeder: "Burn Pile",
    seeds: [
      { name: "Amnesia Haze Auto", count: 4, type: "Autoflower" },
      { name: "Black Domina Auto", count: 4, type: "Autoflower" },
      { name: "CBD White Widow Auto", count: 3, type: "Autoflower" },
      { name: "Northern Lights Auto", count: 2, type: "Autoflower" },
      { name: "Special Lime Haze Auto", count: 2, type: "Autoflower" },
      { name: "Purple Glam Kush Auto", count: 2, type: "Autoflower" },
      { name: "Zkittlez Auto", count: 1, type: "Autoflower" },
      { name: "White Widow Auto", count: 5, type: "Autoflower" },
      { name: "Jack Herer Auto", count: 5, type: "Autoflower" },
      { name: "Moby Dick Auto", count: 5, type: "Autoflower" },
      { name: "Kali's Mystery Auto", count: 2, type: "Autoflower" },
      { name: "Durban Poison Auto", count: 2, type: "Autoflower" },
      { name: "Gorilla Glue Auto", count: 5, type: "Autoflower" },
      { name: "Psychedelic (LSD) Auto", count: 3, type: "Autoflower" },
      { name: "Master Grand Kush Auto", count: 3, type: "Autoflower" },
      { name: "White Widow", count: 5, type: "Feminized" },
      { name: "Alien OG", count: 4, type: "Feminized" },
      { name: "Afghan", count: 4, type: "Feminized" },
      { name: "Jack Herer", count: 3, type: "Autoflower" },
    ],
  },
  {
    breeder: "Silly Wonka's Golden Beans / Ethos",
    seeds: [
      { name: "Pocket Kingz (Cowboyz)", count: 6, type: "Feminized", note: "Note: Physical count" },
      { name: "Rozé Cookie Dough", count: 10, type: "Feminized", note: "Note: Physical count" },
      { name: "Rainmaker RBx", count: 5, type: "Feminized", note: "Note: Physical count" },
    ],
  },
  {
    breeder: "Brotanical Gardens",
    seeds: [
      { name: "Animal Mints Auto (Animal Cookies × Sinmint Cookies)", count: 1, type: "Autoflower", note: "Note: Brotanical Gardens branded" },
    ],
  },
];

export const SEEDS: Seed[] = raw.flatMap((group) =>
  group.seeds.map((seed, i) => ({
    id: `${group.breeder}-${i}-${seed.name}`,
    name: seed.name,
    breeder: group.breeder,
    type: seed.type,
    count: seed.count,
    note: seed.note,
  })),
);

export const DEFAULT_SEED_COUNTS: Record<string, number> = Object.fromEntries(
  SEEDS.map((seed) => [seed.id, seed.count ?? 0]),
);

export const BREEDERS = raw.map((group) => group.breeder);

export const VAULT_TOTALS = raw.map((group) => ({
  breeder: group.breeder,
  total: group.seeds.reduce((sum, seed) => sum + seed.count, 0),
}));

export const VAULT_TYPE_TOTALS = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as const).map((type) => ({
  type,
  total: SEEDS.filter((seed) => seed.type === type).reduce((sum, seed) => sum + (seed.count ?? 0), 0),
  strains: SEEDS.filter((seed) => seed.type === type).length,
}));

export const MAIN_VAULT_TOTAL = VAULT_TOTALS.filter((group) => group.breeder !== "Burn Pile").reduce(
  (sum, group) => sum + group.total,
  0,
);

export const BURN_PILE_TOTAL = VAULT_TOTALS.find((group) => group.breeder === "Burn Pile")?.total ?? 0;
export const GRAND_TOTAL = MAIN_VAULT_TOTAL + BURN_PILE_TOTAL;
