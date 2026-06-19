import type { Seed } from "@/data/seeds";
import { estimateAdvancedMetrics } from "@/lib/crossName";

export type ExtractionProfile = {
  rosin: {
    flower: number; // press flower directly
    drySift: number; // press dry-sift hash
    bubbleHash: number; // press bubble hash
  };
  liveRosin: number; // fresh-frozen → bubble → press
  resin: number; // solvent (BHO-style) resin
  liveResin: number; // fresh-frozen solvent resin
  cart: {
    rosin: number;
    liveRosin: number;
    resin: number;
    liveResin: number;
  };
  overall: number; // 1-5 blended score for sorting
};

const clamp = (v: number) => Math.min(5, Math.max(1, Math.round(v)));

// Estimates solventless/solvent quality and 510-cart suitability from name + lineage cues.
export function estimateExtractionProfile(seed: Seed): ExtractionProfile {
  const adv = estimateAdvancedMetrics(seed);
  const text = `${seed.name} ${seed.breeder}`.toLowerCase();
  const resin = adv.resinDensity; // 1-5
  const terp = adv.terpeneIntensity; // 1-5

  // Lineages known to wash heavily into full-melt hash.
  const washy = /gmo|cookies|gelato|runtz|zkittlez|papaya|sherb|sherbet|wedding|cake|chem|sundae|slurricane|cap junkie|permanent marker|gushers|mac|ice cream|hash|temple|kush/i.test(text);
  // Frosty/trichome-heavy cues.
  const frosty = /frost|diamond|platinum|white|glue|gorilla|snow|widow/i.test(text);
  // Harder-to-wash, airy sativa cues.
  const lowWash = /haze|durban|thai|malawi|amnesia|jack|neville/i.test(text);

  let washBonus = 0;
  if (washy) washBonus += 1;
  if (frosty) washBonus += 0.5;
  if (lowWash) washBonus -= 1.2;

  const flowerRosin = clamp(resin * 0.8 + washBonus + 0.3);
  const drySift = clamp(resin * 0.7 + washBonus + (frosty ? 0.6 : 0));
  const bubbleHash = clamp(resin * 0.85 + washBonus + 0.4);

  const liveRosin = clamp(resin * 0.7 + terp * 0.4 + washBonus);
  const resinVal = clamp(resin * 0.6 + 2.2); // solvent grabs almost everything
  const liveResin = clamp(resin * 0.5 + terp * 0.5 + 1.8);

  // 510 cart suitability — resin/distillate is the most cart-friendly,
  // rosin can be thicker/harder to fill cleanly.
  const cartResin = clamp(resinVal * 0.6 + 2.4);
  const cartLiveResin = clamp(liveResin * 0.6 + terp * 0.3 + 1.6);
  const cartRosin = clamp(flowerRosin * 0.5 + terp * 0.3 + 0.8);
  const cartLiveRosin = clamp(liveRosin * 0.55 + terp * 0.35 + 0.9);

  const overall = clamp((flowerRosin + bubbleHash + liveRosin + resinVal + liveResin) / 5);

  return {
    rosin: { flower: flowerRosin, drySift, bubbleHash },
    liveRosin,
    resin: resinVal,
    liveResin,
    cart: { rosin: cartRosin, liveRosin: cartLiveRosin, resin: cartResin, liveResin: cartLiveResin },
    overall,
  };
}

const avg = (a: number, b: number) => clamp((a + b) / 2);

// Blends two parent profiles into an estimated outlook for their offspring.
export function estimateCrossExtraction(parentA: Seed, parentB: Seed): ExtractionProfile {
  const a = estimateExtractionProfile(parentA);
  const b = estimateExtractionProfile(parentB);
  return {
    rosin: {
      flower: avg(a.rosin.flower, b.rosin.flower),
      drySift: avg(a.rosin.drySift, b.rosin.drySift),
      bubbleHash: avg(a.rosin.bubbleHash, b.rosin.bubbleHash),
    },
    liveRosin: avg(a.liveRosin, b.liveRosin),
    resin: avg(a.resin, b.resin),
    liveResin: avg(a.liveResin, b.liveResin),
    cart: {
      rosin: avg(a.cart.rosin, b.cart.rosin),
      liveRosin: avg(a.cart.liveRosin, b.cart.liveRosin),
      resin: avg(a.cart.resin, b.cart.resin),
      liveResin: avg(a.cart.liveResin, b.cart.liveResin),
    },
    overall: avg(a.overall, b.overall),
  };
}