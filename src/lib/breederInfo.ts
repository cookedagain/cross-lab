// Short descriptions + metadata for each breeder, giving the breeders pages a
// "discography" / label feel. Any breeder not listed here falls back to a
// generic blurb so newly added stock still renders cleanly.

export type BreederInfo = {
  blurb: string;
  origin?: string;
  knownFor: string[];
};

export const BREEDER_INFO: Record<string, BreederInfo> = {
  "Ethos Genetics": {
    blurb:
      "Colorado-based powerhouse known for vigorous, high-yielding, terp-forward lines and an obsession with selection and Multipass releases.",
    origin: "Colorado, USA",
    knownFor: ["Multipass drops", "Crescendo / Lilac Diesel", "Temple Kush work"],
  },
  "Binchickens Genetics": {
    blurb:
      "Australian breeder preserving landrace and hashplant heritage, with ABC mutant projects and the Banksia Tar Kush line.",
    origin: "Australia",
    knownFor: ["Banksia Tar Kush", "ABC / mutant lines", "Deep Chunk preservation"],
  },
  "Terpyz Mutant Genetics": {
    blurb:
      "Specialists in mutant and ABC morphology — duck-foot, webbed leaf, and other oddball expressions for collectors.",
    knownFor: ["Mutant traits", "ABC lines", "Collector phenos"],
  },
  "Black Leaf Genetics": {
    blurb: "Frosty, resin-chasing selections with dessert and gas leaning profiles.",
    knownFor: ["Heavy resin", "Dessert profiles", "S1 work"],
  },
  "Humboldt Seed Company": {
    blurb:
      "Long-running California breeder with a huge pheno-hunting operation and reliable, commercially proven cultivars.",
    origin: "California, USA",
    knownFor: ["Large-scale selection", "Gas & funk", "Proven cultivars"],
  },
  "In-House Genetics": {
    blurb: "Known for Platinum and Slurricane lines, with sticky, resinous, dessert-gas hybrids.",
    knownFor: ["Slurricane", "Platinum lines", "Resin"],
  },
  "WolfPack Selections": {
    blurb: "Boutique selections focused on funk, gas, and unique terpene combinations.",
    knownFor: ["GMO crosses", "Funk", "Boutique drops"],
  },
  "Happy Valley Genetics": {
    blurb: "Australian breeder working hyped lineages and End Game-derived projects.",
    origin: "Australia",
    knownFor: ["End Game work", "Hyped lineages"],
  },
  "Brothers Grimm": {
    blurb:
      "Legendary old-school breeder behind classics like Cinderella 99, famous for fruity, energetic sativa-leaning lines.",
    knownFor: ["Cinderella 99 heritage", "Fruity sativas", "Classic genetics"],
  },
  "Greenspace AU": {
    blurb: "Australian breeder with heavy-yield and classic cheese/funk cultivars plus a few autos.",
    origin: "Australia",
    knownFor: ["Heavy yield", "Exodus Cheese", "Autos"],
  },
  "7 East Genetics": {
    blurb: "East Coast genetics focused on distinctive regular-seed lines and preservation-oriented breeding stock.",
    knownFor: ["Regular seeds", "Freaks of Dank"],
  },
  "G13 Labs": {
    blurb:
      "G13 Labs banner for Cheeselicious and Pineapple Express × Runtz 13 seed lots associated with Greenspace AU breeding.",
    knownFor: ["Cheeselicious", "Pineapple Express × Runtz 13", "Greenspace AU-bred stock"],
  },
  "Burn Pile": {
    blurb:
      "Utility shelf only — white-label / potentially mislabelled stock kept for one-and-only smoke/test runs. Not a breeding or preservation source.",
    knownFor: ["One-and-done runs", "Test stock", "Not for breeding"],
  },
};

export const getBreederInfo = (breeder: string): BreederInfo =>
  BREEDER_INFO[breeder] ?? {
    blurb: "Breeder in your vault. No catalogue notes recorded yet.",
    knownFor: [],
  };