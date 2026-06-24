"use client";

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, HelpCircle, Info, Lightbulb, Sparkles, TrendingUp, Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CYCO_PRODUCTS, CYCO_SCHEDULE, type CycoKey } from "@/lib/cycoFeed";

const PRESET_STATIONS = [
  { name: "VGrow Smart Box", lightWattage: 100, fanWattage: 20, estYieldMin: 35, estYieldMax: 80, resSize: 11, resCount: 1 },
  { name: "AC Infinity 2×2", lightWattage: 100, fanWattage: 30, estYieldMin: 45, estYieldMax: 110, resSize: 19, resCount: 1 },
  { name: "AC Infinity 4×4", lightWattage: 500, fanWattage: 70, estYieldMin: 120, estYieldMax: 400, resSize: 19, resCount: 4 },
];

const DEFAULT_BOTTLE_PRICES: Record<CycoKey, number> = {
  growA: 55,
  growB: 55,
  bloomA: 55,
  bloomB: 55,
  silica: 90,
  ryzofuel: 220,
  b1boost: 110,
  zyme: 10,
  xl: 20,
  swell: 25,
  potashPlus: 30,
  kleanse: 20,
  drRepair: 25,
  uptake: 30,
};

const GrowCostCalculator = () => {
  // Inputs
  const [lightWatts, setLightWatts] = useState<number>(220);
  const [fanWatts, setFanWatts] = useState<number>(40);
  const [vegWeeks, setVegWeeks] = useState<number>(4);
  const [flowerWeeks, setFlowerWeeks] = useState<number>(9);
  const [kwhRate, setKwhRate] = useState<number>(0.32); // AUD/USD average rate
  const [nutrientCost, setNutrientCost] = useState<number>(80); // Flat estimate for bottles/mixes
  const [mediumCost, setMediumCost] = useState<number>(40); // Soil, coco, pots, etc.
  const [otherCost, setOtherCost] = useState<number>(30); // Seeds, carbon filter wear, water, etc.
  const [expectedYield, setExpectedYield] = useState<number>(150); // Expected dry yield in grams

  // Cyco Nutrient Calculator Inputs
  const [resSize, setResSize] = useState<number>(15);
  const [resCount, setResCount] = useState<number>(1);
  const [changesPerWeek, setChangesPerWeek] = useState<number>(1);
  const [bottlePrices, setBottlePrices] = useState<Record<CycoKey, number>>(DEFAULT_BOTTLE_PRICES);
  const [useCalculatedNutrients, setUseCalculatedNutrients] = useState<boolean>(false);
  const [costType, setCostType] = useState<"consumed" | "upfront">("consumed");

  // Apply preset
  const applyPreset = (preset: typeof PRESET_STATIONS[0]) => {
    setLightWatts(preset.lightWattage);
    setFanWatts(preset.fanWattage);
    setExpectedYield(Math.round((preset.estYieldMin + preset.estYieldMax) / 2));
    setResSize(preset.resSize);
    setResCount(preset.resCount);
  };

  // Calculate Cyco Nutrients needed for the run
  const cycoNutrientCalculations = useMemo(() => {
    const totalsMl: Record<CycoKey, number> = {
      ryzofuel: 0, growA: 0, growB: 0, bloomA: 0, bloomB: 0,
      silica: 0, b1boost: 0, zyme: 0, xl: 0, swell: 0,
      potashPlus: 0, drRepair: 0, uptake: 0, kleanse: 0
    };

    const totalVeg = Math.max(1, vegWeeks);
    const totalFlower = Math.max(1, flowerWeeks);
    const totalWeeks = 1 + totalVeg + 1 + totalFlower + 1; // Seedling + Veg + Transition + Flower + Flush

    for (let w = 1; w <= totalWeeks; w++) {
      let rates: Partial<Record<CycoKey, number>> = {};

      if (w === 1) {
        rates = CYCO_SCHEDULE[0].rates; // Seedling
      } else if (w <= 1 + totalVeg) {
        // Veg weeks (schedule index 1 to 3, which are weeks 2 to 4)
        const vegWeekNum = w - 1;
        const schedIndex = Math.min(1 + (vegWeekNum - 1), 3);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else if (w === 1 + totalVeg + 1) {
        rates = CYCO_SCHEDULE[4].rates; // Transition (week 5)
      } else if (w <= 1 + totalVeg + 1 + totalFlower) {
        // Flower weeks (schedule index 5 to 9, which are weeks 6 to 10)
        const flowerWeekNum = w - (1 + totalVeg + 1);
        const schedIndex = Math.min(5 + (flowerWeekNum - 1), 9);
        rates = CYCO_SCHEDULE[schedIndex].rates;
      } else {
        rates = CYCO_SCHEDULE[10].rates; // Flush (week 11)
      }

      // Add up the mL needed for this week
      Object.entries(rates).forEach(([key, rate]) => {
        const cycoKey = key as CycoKey;
        const weeklyMl = (rate ?? 0) * resSize * resCount * changesPerWeek;
        totalsMl[cycoKey] = (totalsMl[cycoKey] ?? 0) + weeklyMl;
      });
    }

    // Calculate costs
    let totalConsumedCost = 0;
    let totalUpfrontCost = 0;
    const productBreakdown = Object.entries(totalsMl).map(([key, ml]) => {
      const cycoKey = key as CycoKey;
      const price = bottlePrices[cycoKey] ?? 0;
      const litersNeeded = ml / 1000;
      const bottlesNeeded = Math.ceil(ml / 5000); // 5L bottles
      
      const consumedCost = (ml / 5000) * price;
      const upfrontCost = bottlesNeeded * price;

      totalConsumedCost += consumedCost;
      totalUpfrontCost += upfrontCost;

      return {
        key: cycoKey,
        product: CYCO_PRODUCTS[cycoKey],
        ml,
        litersNeeded,
        bottlesNeeded,
        consumedCost,
        upfrontCost,
      };
    }).filter(item => item.ml > 0);

    return {
      productBreakdown,
      totalConsumedCost,
      totalUpfrontCost,
    };
  }, [vegWeeks, flowerWeeks, resSize, resCount, changesPerWeek, bottlePrices]);

  // Update bottle price
  const handlePriceChange = (key: CycoKey, val: number) => {
    setBottlePrices(prev => ({ ...prev, [key]: Math.max(0, val) }));
  };

  // Calculations for main cost summary
  const calculations = useMemo(() => {
    const vegDays = vegWeeks * 7;
    const flowerDays = flowerWeeks * 7;

    // Light consumption (Veg: 18h/day, Flower: 12h/day)
    const lightVegKwh = (lightWatts * 18 * vegDays) / 1000;
    const lightFlowerKwh = (lightWatts * 12 * flowerDays) / 1000;
    const totalLightKwh = lightVegKwh + lightFlowerKwh;

    // Fan consumption (Runs 24h/day throughout)
    const totalFanKwh = (fanWatts * 24 * totalDays) / 1000;

    const totalKwh = totalLightKwh + totalFanKwh;
    const electricityCost = totalKwh * kwhRate;

    const activeNutrientCost = useCalculatedNutrients
      ? (costType === "consumed" ? cycoNutrientCalculations.totalConsumedCost : cycoNutrientCalculations.totalUpfrontCost)
      : Number(nutrientCost);

    const totalConsumables = activeNutrientCost + Number(mediumCost) + Number(otherCost);
    const totalCost = electricityCost + totalConsumables;

    const costPerGram = expectedYield > 0 ? totalCost / expectedYield : 0;

    return {
      lightVegKwh,
      lightFlowerKwh,
      totalLightKwh,
      totalFanKwh,
      totalKwh,
      electricityCost,
      activeNutrientCost,
      totalConsumables,
      totalCost,
      costPerGram,
    };
  }, [lightWatts, fanWatts, vegWeeks, flowerWeeks, kwhRate, nutrientCost, mediumCost, otherCost, expectedYield, useCalculatedNutrients, costType, cycoNutrientCalculations]);

  return (
    <div className="space-y-6">
      <section className="mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 text-primary">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">Grow Cost Calculator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estimate the total cost of your run including electricity, nutrients, and consumables, and see your cost per gram.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_STATIONS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold transition hover:border-primary hover:text-primary"
              >
                {preset.name} ({preset.lightWattage}W)
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs Form */}
          <div className="space-y-4 rounded-3xl border border-border bg-background p-4">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Equipment & Power</p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Light Draw (Watts)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary">
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      The actual wall draw of your LED light fixture.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <Input
                  type="number"
                  value={lightWatts}
                  onChange={(event) => setLightWatts(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                  Fan & Extras (Watts)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary">
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Combined wattage of extraction fans, clip fans, pumps, and controllers running 24/7.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <Input
                  type="number"
                  value={fanWatts}
                  onChange={(event) => setFanWatts(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Veg Weeks</span>
                <Input
                  type="number"
                  value={vegWeeks}
                  onChange={(event) => setVegWeeks(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Flower Weeks</span>
                <Input
                  type="number"
                  value={flowerWeeks}
                  onChange={(event) => setFlowerWeeks(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Rate per kWh ($)</span>
                <Input
                  type="number"
                  step="0.01"
                  value={kwhRate}
                  onChange={(event) => setKwhRate(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>
            </div>

            <p className="border-t border-border/60 pt-3 text-xs font-black uppercase tracking-wide text-primary">Consumables & Yield</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Nutrients ($)</span>
                {useCalculatedNutrients ? (
                  <div className="flex h-10 items-center rounded-xl border border-border bg-muted/50 px-3 text-sm font-bold text-primary">
                    ${calculations.activeNutrientCost.toFixed(2)}
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={nutrientCost}
                    onChange={(event) => setNutrientCost(Number(event.target.value))}
                    className="h-10 rounded-xl font-semibold"
                  />
                )}
              </div>

              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Medium & Pots ($)</span>
                <Input
                  type="number"
                  value={mediumCost}
                  onChange={(event) => setMediumCost(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Other / Seeds ($)</span>
                <Input
                  type="number"
                  value={otherCost}
                  onChange={(event) => setOtherCost(Number(event.target.value))}
                  className="h-10 rounded-xl font-semibold"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-muted-foreground">
                Expected Dry Yield (Grams)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-primary">
                      <HelpCircle className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Total expected dry weight of usable flower harvested from this run.
                  </TooltipContent>
                </Tooltip>
              </span>
              <Input
                type="number"
                value={expectedYield}
                onChange={(event) => setExpectedYield(Math.max(1, Number(event.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            {/* Link to Cyco Calculator */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">Use Cyco Platinum Feed Cost?</span>
                <button
                  type="button"
                  onClick={() => setUseCalculatedNutrients(!useCalculatedNutrients)}
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide transition ${
                    useCalculatedNutrients
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {useCalculatedNutrients ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="mt-1 text-muted-foreground">
                Automatically syncs the calculated Cyco Platinum nutrient cost from the calculator below.
              </p>
            </div>
          </div>

          {/* Outputs & Summary */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-background p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Run Cost Summary</p>
              
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Electricity Cost</p>
                  <p className="mt-1 font-display text-2xl font-black text-foreground">
                    ${calculations.electricityCost.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                    {calculations.totalKwh.toFixed(1)} kWh total used
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Consumables Cost</p>
                  <p className="mt-1 font-display text-2xl font-black text-foreground">
                    ${calculations.totalConsumables.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                    Nutrients, medium & extras
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-primary">Total Run Cost</p>
                    <p className="mt-1 font-display text-3xl font-black text-primary">
                      ${calculations.totalCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cost Per Gram</p>
                    <p className="mt-1 font-display text-2xl font-black text-foreground">
                      ${calculations.costPerGram.toFixed(2)}/g
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown details */}
              <div className="mt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Veg Light Power ({vegWeeks} wks @ 18h/day)</span>
                  <span className="text-foreground">{calculations.lightVegKwh.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Flower Light Power ({flowerWeeks} wks @ 12h/day)</span>
                  <span className="text-foreground">{calculations.lightFlowerKwh.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Fan & Extras Power (24/7 continuous)</span>
                  <span className="text-foreground">{calculations.totalFanKwh.toFixed(1)} kWh</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="leading-relaxed">
                Power calculations assume lights and fans run at full draw. Dimming LEDs during early veg or using smart controllers will reduce actual electricity costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cyco Platinum Nutrient Cost Calculator */}
      <section className="rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 text-primary">
            <Beaker className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">Cyco Platinum Nutrient Calculator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Calculate the exact volume and cost of Cyco Platinum nutrients needed for your entire run based on 5L bottles.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inputs */}
          <div className="space-y-4 rounded-3xl border border-border bg-background p-4 lg:col-span-1">
            <p className="text-xs font-black uppercase tracking-wide text-primary">Reservoir Setup</p>
            
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Reservoir Size (L)</span>
              <Input
                type="number"
                value={resSize}
                onChange={(e) => setResSize(Math.max(1, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Number of Reservoirs / Buckets</span>
              <Input
                type="number"
                value={resCount}
                onChange={(e) => setResCount(Math.max(1, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Reservoir Changes Per Week</span>
              <Input
                type="number"
                value={changesPerWeek}
                onChange={(e) => setChangesPerWeek(Math.max(1, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <div className="border-t border-border/60 pt-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Cost Calculation Mode</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCostType("consumed")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                    costType === "consumed"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  Consumed Cost
                </button>
                <button
                  type="button"
                  onClick={() => setCostType("upfront")}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                    costType === "upfront"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  Upfront Cost
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                {costType === "consumed"
                  ? "Calculates the exact cost of nutrients used (proportional to the 5L bottle volume)."
                  : "Calculates the cost of buying full 5L bottles needed to complete the run."}
              </p>
            </div>
          </div>

          {/* Product Breakdown & Prices */}
          <div className="rounded-3xl border border-border bg-background p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-primary">Nutrient Breakdown & 5L Bottle Prices</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                Total: ${costType === "consumed" ? cycoNutrientCalculations.totalConsumedCost.toFixed(2) : cycoNutrientCalculations.totalUpfrontCost.toFixed(2)}
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {cycoNutrientCalculations.productBreakdown.map((item) => (
                <div key={item.key} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.product.color }} />
                      <p className="text-sm font-bold truncate">{item.product.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Total needed: <span className="font-bold text-foreground">{item.ml.toLocaleString()} mL</span> ({item.litersNeeded.toFixed(2)}L)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Requires <span className="font-bold text-foreground">{item.bottlesNeeded}</span> × 5L bottle(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28">
                      <span className="block text-[9px] font-black uppercase text-muted-foreground">5L Bottle Price ($)</span>
                      <Input
                        type="number"
                        value={bottlePrices[item.key]}
                        onChange={(e) => handlePriceChange(item.key, Number(e.target.value))}
                        className="h-8 rounded-lg font-semibold text-xs"
                      />
                    </div>
                    <div className="text-right w-20">
                      <span className="block text-[9px] font-black uppercase text-muted-foreground">Cost</span>
                      <span className="text-sm font-black text-primary">
                        ${costType === "consumed" ? item.consumedCost.toFixed(2) : item.upfrontCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {cycoNutrientCalculations.productBreakdown.length === 0 && (
                <p className="text-center py-8 text-sm text-muted-foreground font-semibold">
                  No nutrients calculated. Ensure Veg/Flower weeks and reservoir sizes are set.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GrowCostCalculator;