export type SeedType = "Feminized" | "Regular" | "Autoflower" | "Unknown Photo";

export type Seed = {
  id: string;
  name: string;
  breeder: string;
  type: SeedType;
  count?: number;
};

type SeedEntry = {
  name: string;
  count: number;
};

const raw: { breeder: string; seeds: SeedEntry[] }[] = [];

const ETHOS_REGULAR = new Set<string>();
const FEMINIZED_BREEDERS = new Set<string>();
const REGULAR_BREEDERS = new Set<string>();

const getSeedType = (breeder: string, seed: SeedEntry): SeedType => {
  if (/\bauto\b/i.test(seed.name)) return "Autoflower";
  if (breeder === "Ethos Genetics") return ETHOS_REGULAR.has(seed.name) ? "Regular" : "Feminized";
  if (REGULAR_BREEDERS.has(breeder)) return "Regular";
  if (FEMINIZED_BREEDERS.has(breeder)) return "Feminized";
  return "Feminized";
};

export const SEEDS: Seed[] = raw.flatMap((group) =>
  group.seeds.map((seed, i) => ({
    id: `${group.breeder}-${i}-${seed.name}`,
    name: seed.name,
    breeder: group.breeder,
    type: getSeedType(group.breeder, seed),
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

export const VAULT_TYPE_TOTALS = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as const).map((type) => ({
  type,
  total: SEEDS.filter((seed) => seed.breeder !== "Burn Pile" && seed.type === type).reduce(
    (sum, seed) => sum + (seed.count ?? 0),
    0,
  ),
  strains: SEEDS.filter((seed) => seed.breeder !== "Burn Pile" && seed.type === type).length,
}));

export const MAIN_VAULT_TOTAL = VAULT_TOTALS.filter((group) => group.breeder !== "Burn Pile").reduce(
  (sum, group) => sum + group.total,
  0,
);

export const BURN_PILE_TOTAL = VAULT_TOTALS.find((group) => group.breeder === "Burn Pile")?.total ?? 0;
export const GRAND_TOTAL = MAIN_VAULT_TOTAL + BURN_PILE_TOTAL;
