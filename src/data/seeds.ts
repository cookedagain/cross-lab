export type Seed = {
  id: string;
  name: string;
  breeder: string;
  count?: number;
};

type SeedEntry = {
  name: string;
  count: number;
};

const raw: { breeder: string; seeds: SeedEntry[] }[] = [
  {
    breeder: "Ethos Genetics",
    seeds: [
      { name: "End Game #3 × Grandpa's Cookies #10", count: 3 },
      { name: "Durban Poison × Lilac Diesel #22", count: 6 },
      { name: "Uber Cherry", count: 3 },
      { name: "Temple Kush F2 × Temple of the Dog BX", count: 10 },
      { name: "Temple Kush F2 × California Black Rozé #10", count: 10 },
      { name: "Quattro Kush F3 × OG Kush BX3", count: 10 },
      { name: "CrescendØ #2 × Marshmallow OG", count: 5 },
      { name: "Quattro Kush F3 × Zweet Inzanity", count: 10 },
      { name: "Temple Kush F2 × Mandarin Cookies R2 #7", count: 10 },
      { name: "Quattro Kush F3", count: 10 },
      { name: "Cherry TK F2", count: 5 },
      { name: "Grandpa's Cookies × End Game #5", count: 5 },
      { name: "Quattro Kush F3 × Sour Diesel BX3", count: 10 },
      { name: "End Game #5 S1", count: 5 },
      { name: "Grape Diamonds × Lilac Diesel BX3", count: 8 },
      { name: "Grape Diamonds × End Game #5", count: 5 },
      { name: "Quattro Kush F3 × Granddaddy Purple", count: 10 },
      { name: "Temple Kush F2 × Zkittlez BX1", count: 10 },
      { name: "Fruity Pebbles OG × Lilac Diesel BX3", count: 10 },
      { name: "Lemon Cherry Gelato × SVF OG", count: 3 },
      { name: "CrescendØ #2 × Cherry Pie", count: 5 },
      { name: "Temple Kush F2 × Blueberry Muffin Bubba", count: 10 },
      { name: "Granddaddy Purple × Quattro Kush", count: 3 },
      { name: "Permanent Marker × OG Kush BX4", count: 3 },
      { name: "Blueberry Cookies × MCV3", count: 3 },
      { name: "Tropical Cherry × Marshmallow OG", count: 3 },
      { name: "White Wedding × Zweet OG", count: 3 },
      { name: "All the Sauces R1", count: 5 },
      { name: "CrescendØ #2 × End Game #3", count: 5 },
      { name: "Wrank × End Game", count: 5 },
      { name: "Spanish Moon × Grandpa's Stash #12", count: 5 },
      { name: "Lilac Diesel BX3", count: 10 },
      { name: "Temple Kush F2 × Peach CrescendØ #2", count: 10 },
      { name: "Peach CrescendØ F1 × Grandpa's Stash #12", count: 5 },
      { name: "Temple Kush F2 × Purple Zkittlez", count: 10 },
      { name: "Punch Line RBX × Grandpa's Stash #12", count: 5 },
      { name: "Purple Sunset × Lilac Diesel BX3", count: 10 },
      { name: "Quattro Kush F3 × Purple Majik #10", count: 10 },
      { name: "Apples & Bananas Auto", count: 4 },
      { name: "CrescendØ #16 × SVF OG", count: 5 },
      { name: "Super Lemon Haze × Zweet Auto", count: 3 },
      { name: "CrescendØ #2 × End Game #5", count: 5 },
      { name: "Temple Kush F3", count: 10 },
      { name: "GMO Cookies × Lilac Diesel BX3", count: 10 },
      { name: "Grandpa's Stash #6 × End Game #5", count: 5 },
      { name: "10th Planet × Grandpa's Stash #12", count: 5 },
      { name: "XXX #20 × End Game #5", count: 5 },
      { name: "Temple Kush F2 × CrescendØ #16", count: 10 },
      { name: "Temple Kush F2", count: 10 },
      { name: "NYCD × Lilac Diesel BX3", count: 10 },
      { name: "End Game R2 × Grandpa's Stash #12", count: 5 },
      { name: "High Note R1", count: 3 },
      { name: "Temple Kush F2 × Heirloom Purple", count: 10 },
      { name: "Banana RF7 Auto", count: 3 },
      { name: "CrescendØ #6 × Lilac Diesel BX3", count: 10 },
      { name: "Pina #5 × Zweet Auto", count: 3 },
      { name: "Quattro Kush F3 × Lilac Diesel", count: 10 },
      { name: "CrescendØ #2 × SVF OG", count: 5 },
      { name: "Temple Kush F2 × Wedding Cake", count: 10 },
      { name: "CrescendØ #16 × Tahoe OG", count: 5 },
      { name: "Temple Kush F2 × CrescendØ #6", count: 10 },
      { name: "Original CrescendØ × Grandpa's Stash #12", count: 5 },
      { name: "Temple Kush F2 × OG D Lux", count: 10 },
      { name: "Lilac Diesel Auto × Zweet Auto", count: 4 },
      { name: "Banana Hammock × Lilac Diesel #22", count: 4 },
      { name: "Jealousy × Banana Daddy Auto", count: 2 },
      { name: "Josh D OG BX3", count: 20 },
      { name: "Krux × Grandpa's Cookies #6", count: 2 },
      { name: "Grape Diamonds × Grandpa's Cookies #6", count: 2 },
      { name: "Grandpa's Cookies #3 × Josh D OG BX3", count: 20 },
      { name: "Lilac Diesel × Pineapple Runtz Auto", count: 2 },
      { name: "Cap Junkie × End Game #3", count: 9 },
      { name: "Blueberry Cookies", count: 2 },
    ],
  },
  {
    breeder: "Binchickens Genetics",
    seeds: [
      { name: "Banksia Tar Kush F2 #9", count: 20 },
      { name: "Banksia Tar Kush F2 #14", count: 17 },
      { name: "Banksia Tar Kush F2 #6", count: 35 },
      { name: "Banksia Tar Kush V1", count: 25 },
      { name: "Dog Downunder ABC", count: 18 },
      { name: "Wombat Breath ABC", count: 16 },
      { name: "Deep Chunk", count: 23 },
      { name: "Ol Betsy × Chem91 × Deep Chunk", count: 17 },
    ],
  },
  {
    breeder: "Terpyz Mutant Genetics",
    seeds: [
      { name: "Mentha de Croco", count: 12 },
      { name: "Quackberry Rose", count: 12 },
      { name: "Bubblegum GPP", count: 6 },
      { name: "Feral Fuel ABC", count: 13 },
    ],
  },
  {
    breeder: "Black Leaf Genetics",
    seeds: [
      { name: "Frozen Baller", count: 2 },
      { name: "Yeti Blast", count: 2 },
      { name: "Hash Bar", count: 2 },
      { name: "Pink Nectar", count: 2 },
      { name: "Ice Rock Candy", count: 2 },
      { name: "Frozen Bag S1", count: 3 },
    ],
  },
  {
    breeder: "Humboldt Seed Company",
    seeds: [
      { name: "Garlic Budder", count: 5 },
      { name: "Sapphire OG", count: 5 },
      { name: "Gorilla Breath", count: 1 },
      { name: "Sugar Breath", count: 1 },
    ],
  },
  {
    breeder: "In-House Genetics",
    seeds: [
      { name: "Random Platinum Cross", count: 4 },
      { name: "Slurricane #44 RBX", count: 3 },
    ],
  },
  {
    breeder: "WolfPack Selections",
    seeds: [{ name: "Fruit Funk (GMO × Guava Biscotti)", count: 6 }],
  },
  {
    breeder: "Happy Valley Genetics",
    seeds: [
      { name: "Game Over", count: 10 },
      { name: "End Game #3 S1", count: 6 },
    ],
  },
  {
    breeder: "Brothers Grimm",
    seeds: [
      { name: "Bubble's Blueberry F4", count: 18 },
      { name: "Ricky's Hash Plant", count: 20 },
      { name: "Julian's Black Tee Tangie", count: 20 },
    ],
  },
  {
    breeder: "Greenspace AU",
    seeds: [
      { name: "Heavy Bud", count: 5 },
      { name: "Super Bud", count: 5 },
      { name: "Exodus Cheese", count: 5 },
      { name: "Mango Smile Auto", count: 3 },
    ],
  },
  {
    breeder: "Burn Pile",
    seeds: [
      { name: "Amnesia Haze Auto", count: 4 },
      { name: "Black Domina Auto", count: 4 },
      { name: "CBD White Widow Auto", count: 3 },
      { name: "Northern Lights Auto", count: 2 },
      { name: "Special Lime Haze Auto", count: 2 },
      { name: "Purple Glam Kush Auto", count: 2 },
      { name: "Zkittlez Auto", count: 1 },
      { name: "White Widow Auto", count: 5 },
      { name: "Jack Herer Auto", count: 5 },
      { name: "Moby Dick Auto", count: 5 },
      { name: "Kali's Mystery Auto", count: 2 },
      { name: "Durban Poison Auto", count: 2 },
      { name: "Gorilla Glue Auto", count: 5 },
      { name: "Psychedelic (LSD) Auto", count: 3 },
      { name: "Master Grand Kush Auto", count: 3 },
      { name: "White Widow", count: 5 },
      { name: "Alien OG", count: 4 },
      { name: "Afghan", count: 4 },
      { name: "Jack Herer Photo", count: 3 },
    ],
  },
];

export const SEEDS: Seed[] = raw.flatMap((group) =>
  group.seeds.map((seed, i) => ({
    id: `${group.breeder}-${i}-${seed.name}`,
    name: seed.name,
    breeder: group.breeder,
    count: seed.count,
  })),
);

export const DEFAULT_SEED_COUNTS: Record<string, number> = Object.fromEntries(
  SEEDS.map((seed) => [seed.id, seed.count ?? 0]),
);

export const BREEDERS = raw.map((g) => g.breeder);

export const VAULT_TOTALS = raw.map((group) => ({
  breeder: group.breeder,
  total: group.seeds.reduce((sum, seed) => sum + seed.count, 0),
}));

export const MAIN_VAULT_TOTAL = VAULT_TOTALS.filter((group) => group.breeder !== "Burn Pile").reduce(
  (sum, group) => sum + group.total,
  0,
);

export const BURN_PILE_TOTAL = VAULT_TOTALS.find((group) => group.breeder === "Burn Pile")?.total ?? 0;
export const GRAND_TOTAL = MAIN_VAULT_TOTAL + BURN_PILE_TOTAL;
