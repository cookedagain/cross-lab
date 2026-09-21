export const VAULT_LEDGER_STATUS = {
  authorityDate: "21 September 2026 AEST",
  provisional: true,
  preOutboundSeeds: 2032,
  preOutboundRows: 244,
  workingPhysicalSeeds: 1961,
  workingPhysicalRows: 242,
  provisionalOutboundSeeds: 71,
  provisionalOutboundLines: 11,
  countKnownIncomingSeeds: 470,
  workingFutureFloor: 2431,
} as const;

export type OutboundRecord = {
  breeder: string;
  cultivar: string;
  sex: "Feminized" | "Regular";
  preSend: string;
  provisionalSent: number;
  workingRetained: string;
};

export const PIXIE_OUTBOUND_RECORDS: OutboundRecord[] = [
  { breeder: "Brothers Grimm", cultivar: "Ricky's Hash Plant", sex: "Feminized", preSend: "20", provisionalSent: 8, workingRetained: "12" },
  { breeder: "Silly Wonka's Golden Beans / Ethos", cultivar: "Rozé Cookie Dough — numbered original pack #12", sex: "Feminized", preSend: "25 across five packs", provisionalSent: 5, workingRetained: "20 across five packs" },
  { breeder: "Shoreline Genetics / Overgrow", cultivar: "Sour D — Pack 2", sex: "Regular", preSend: "9", provisionalSent: 9, workingRetained: "0; Pack 1 remains 11" },
  { breeder: "Ethos Genetics", cultivar: "Durban Poison × Lilac Diesel #22", sex: "Feminized", preSend: "11", provisionalSent: 5, workingRetained: "6" },
  { breeder: "Binchickens Genetics", cultivar: "Deep Chunk", sex: "Regular", preSend: "23", provisionalSent: 11, workingRetained: "12" },
  { breeder: "In-House Genetics", cultivar: "ZoFire", sex: "Feminized", preSend: "19", provisionalSent: 8, workingRetained: "11" },
  { breeder: "Ethos Genetics", cultivar: "Orange Velvet Underground RBx", sex: "Feminized", preSend: "10", provisionalSent: 5, workingRetained: "5" },
  { breeder: "Ethos Genetics", cultivar: "Purple Sunset RBx2", sex: "Feminized", preSend: "10", provisionalSent: 5, workingRetained: "5" },
  { breeder: "Rare Dankness", cultivar: "Ghost Train Haze #1", sex: "Feminized", preSend: "5", provisionalSent: 5, workingRetained: "0 — provisional" },
  { breeder: "Ethos Genetics", cultivar: "Mandarin Zkittlez R1", sex: "Feminized", preSend: "10", provisionalSent: 5, workingRetained: "5" },
  { breeder: "Ethos Genetics", cultivar: "Cap Junkie × End Game #3", sex: "Feminized", preSend: "9", provisionalSent: 5, workingRetained: "4 — provisional" },
];

export const PIXIE_DIRECTLY_EXCLUDED = [
  "In-House Genetics · GG #4 × Black Cherry Smoothie · retained 21",
  "In-House Genetics · Platinum Kush Breath · retained 13",
  "In-House Genetics · Slurricane #7 S1 · retained 12",
] as const;
