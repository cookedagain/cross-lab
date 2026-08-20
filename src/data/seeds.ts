export type SeedType = "Feminized" | "Regular" | "Autoflower" | "Unknown Photo";

export type Seed = {
  id: string;
  name: string;
  breeder: string;
  type: SeedType;
  count?: number;
  note?: string;
};

export const SEEDS: Seed[] = [];

export const DEFAULT_SEED_COUNTS: Record<string, number> = {};

export const BREEDERS: string[] = [];

export const VAULT_TOTALS: { breeder: string; total: number }[] = [];

export const VAULT_TYPE_TOTALS = (["Feminized", "Regular", "Autoflower", "Unknown Photo"] as const).map((type) => ({
  type,
  total: 0,
  strains: 0,
}));

export const MAIN_VAULT_TOTAL = 0;
export const BURN_PILE_TOTAL = 0;
export const GRAND_TOTAL = 0;
