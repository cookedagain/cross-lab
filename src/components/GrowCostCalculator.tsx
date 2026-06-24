"use client";

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, HelpCircle, Info, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRESET_STATIONS = [
  { name: "VGrow Smart Box", lightWattage: 100, fanWattage: 20, estYieldMin: 35, estYieldMax: 80 },
  { name: "AC Infinity 2×2", lightWattage: 100, fanWattage: 30, estYieldMin: 45, estYieldMax: 110 },
  { name: "AC Infinity 4×4", lightWattage: 730, fanWattage: 70, estYieldMin: 120, estYieldMax: 400 },
];

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

  // Apply preset
  const applyPreset = (preset: typeof PRESET_STATIONS[0]) => {
    setLightWatts(preset.lightWattage);
    setFanWatts(preset.fanWattage);
    setExpectedYield(Math.round((preset.estYieldMin + preset.estYieldMax) / 2));
  };

  // Calculations
  const calculations = useMemo(() => {
    const vegDays = vegWeeks * 7;
    const flowerDays = flowerWeeks * 7;

    // Light consumption (Veg: 18h/day, Flower: 12h/day)
    const lightVegKwh = (lightWatts * 18 * vegDays) / 1000;
    const lightFlowerKwh = (lightWatts * 12 * flowerDays) / 1000;
    const totalLightKwh = lightVegKwh + lightFlowerKwh;

    // Fan consumption (Runs 24h/day throughout)
    const totalDays = vegDays + flowerDays;
    const totalFanKwh = (fanWatts * 24 * totalDays) / 1000;

    const totalKwh = totalLightKwh + totalFanKwh;
    const electricityCost = totalKwh * kwhRate;

    const totalConsumables = Number(nutrientCost) + Number(mediumCost) + Number(otherCost);
    const totalCost = electricityCost + totalConsumables;

    const costPerGram = expectedYield > 0 ? totalCost / expectedYield : 0;

    return {
      lightVegKwh,
      lightFlowerKwh,
      totalLightKwh,
      totalFanKwh,
      totalKwh,
      electricityCost,
      totalConsumables,
      totalCost,
      costPerGram,
    };
  }, [lightWatts, fanWatts, vegWeeks, flowerWeeks, kwhRate, nutrientCost, mediumCost, otherCost, expectedYield]);

  return (
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
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
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
                onChange={(e) => setLightWatts(Math.max(0, Number(e.target.value)))}
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
                onChange={(e) => setFanWatts(Math.max(0, Number(e.target.value)))}
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
                onChange={(e) => setVegWeeks(Math.max(0, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Flower Weeks</span>
              <Input
                type="number"
                value={flowerWeeks}
                onChange={(e) => setFlowerWeeks(Math.max(0, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Rate per kWh ($)</span>
              <Input
                type="number"
                step="0.01"
                value={kwhRate}
                onChange={(e) => setKwhRate(Math.max(0, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>
          </div>

          <p className="border-t border-border/60 pt-3 text-xs font-black uppercase tracking-wide text-primary">Consumables & Yield</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Nutrients ($)</span>
              <Input
                type="number"
                value={nutrientCost}
                onChange={(e) => setNutrientCost(Math.max(0, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Medium & Pots ($)</span>
              <Input
                type="number"
                value={mediumCost}
                onChange={(e) => setMediumCost(Math.max(0, Number(e.target.value)))}
                className="h-10 rounded-xl font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-muted-foreground">Other / Seeds ($)</span>
              <Input
                type="number"
                value={otherCost}
                onChange={(e) => setOtherCost(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) => setExpectedYield(Math.max(1, Number(e.target.value)))}
              className="h-10 rounded-xl font-semibold"
            />
          </label>
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
  );
};

export default GrowCostCalculator;