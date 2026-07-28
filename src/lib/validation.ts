import { z } from "zod";

const ROTATION_CATEGORIES = ["Flower", "Hash", "Rosin", "Vape", "Oil", "Edible", "Other"] as const;
const CLONE_STATUSES = ["Empty", "Cutting", "Rooting", "Rooted", "Potted"] as const;
const text = (max: number) => z.string().trim().max(max);
const date = z.string().regex(/^$|^\d{4}-\d{2}-\d{2}(?:T[^\s]{1,40})?$/, "Invalid date");

export const multipassSchema = z.object({
  id: text(120).min(1), name: text(160).min(1), parentA: text(160), parentB: text(160),
  type: z.enum(["Feminized", "Regular", "Autoflower", "Unknown Photo"]),
  count: z.number().int().min(0).max(999), arrived: z.boolean(),
}).required();

export const breedingLotSchema = z.object({
  id: text(120).min(1), kind: z.enum(["pollen", "seed"]), name: text(160).min(1), parents: text(320),
  date, quantity: z.number().int().min(0).max(999999), notes: text(2000),
}).required();

export const motherSchema = z.object({
  id: text(120).min(1), name: text(160).min(1), source: text(240),
  dateAdded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"), notes: text(2000),
}).required();

export const cloneSlotSchema = z.object({
  index: z.number().int().min(0).max(23), motherName: text(160), dateTaken: date, status: z.enum(CLONE_STATUSES),
}).required();

const rotationFields = {
  id: text(120).min(1), name: text(160).min(1), brand: text(160), category: z.enum(ROTATION_CATEGORIES),
  thc: z.number().finite().min(0).max(100), cbd: z.number().finite().min(0).max(100),
  startWeight: z.number().finite().min(0).max(100000), remainingWeight: z.number().finite().min(0).max(100000),
  notes: text(2000), rating: z.number().int().min(0).max(5),
};

export const rotationProductSchema = z.object(rotationFields).required();
export const archivedProductSchema = z.object({ ...rotationFields, archivedAt: z.string().datetime() }).required();
export const seedCountsSchema = z.record(text(120), z.number().int().min(0).max(999));

export const backupSchema = z.object({
  version: z.number().int().min(1).max(3),
  seedCounts: seedCountsSchema.optional(),
  multipass: z.array(multipassSchema).max(1000).optional(),
  lots: z.array(breedingLotSchema).max(1000).optional(),
  incomingArrivedIds: z.array(text(160)).max(1000).optional(),
  incomingDrops: z.object({ arrivedIds: z.array(text(160)).max(1000).optional() }).optional(),
}).superRefine((value, ctx) => {
  if (!value.seedCounts && !value.multipass && !value.lots && !value.incomingArrivedIds && !value.incomingDrops) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Backup contains no supported data" });
  }
});
