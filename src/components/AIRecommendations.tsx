/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Droplets, Sprout, Info, Wheat, ListChecks, Leaf, Wallet, Shuffle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { staggerContainer, riseItem, CountUp } from "./MotionKit";
import { AdvisorIcon, SeedIcon, RainIcon, ArrowIcon } from "./icons";

// Result report fades in, then reveals its sections one after another
const resultCard: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.05 } }
};

const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
};

const tabSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } }
} as const;

const parseAmount = (value: unknown) => parseFloat(String(value).replace(/[^0-9.]/g, ""));

// Shared styles
const cardClass = "bg-white border border-slate-200/80 rounded-2xl shadow-sm";
const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "text-xs font-medium text-slate-600";
const primaryButtonClass =
  "w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div variants={riseItem} className="space-y-1.5">
      <label className={labelClass}>{label}</label>
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
      {icon && <span className="text-emerald-700 flex">{icon}</span>}
      {children}
    </h5>
  );
}

function MockBadge() {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium bg-harvest-50 border border-harvest-100 text-harvest-600 px-2.5 py-1 rounded-full">
      <Info className="w-3.5 h-3.5" /> Sample data
    </span>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white/60 border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">{icon}</div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{body}</p>
    </div>
  );
}

// Loading panel shown while the AI endpoints respond
function AIThinking() {
  return (
    <div className={`${cardClass} p-6 overflow-hidden relative`}>
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-50 to-transparent pointer-events-none"
        initial={{ left: "-33%" }}
        animate={{ left: "100%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <AdvisorIcon className="w-5 h-5" animate />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Preparing your recommendation</p>
          <p className="text-xs text-slate-500">Weighing soil, season, water and budget. This usually takes a few seconds.</p>
        </div>
      </div>
      <div className="relative space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="h-16 rounded-xl bg-slate-100"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        {[100, 85, 65].map((w, i) => (
          <motion.div
            key={i}
            className="h-2.5 rounded-full bg-slate-100"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.3 + i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AIRecommendations() {
  const [activeSubTab, setActiveSubTab] = useState<"crop" | "irrigation" | "fertilizer">("crop");
  const [loading, setLoading] = useState(false);
  const [cropResult, setCropResult] = useState<any>(null);
  const [fertilizerResult, setFertilizerResult] = useState<any>(null);

  // Crop Form Inputs
  const [location, setLocation] = useState("Indore, MP");
  const [season, setSeason] = useState("Kharif (Monsoon)");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [budget, setBudget] = useState("Medium (₹25,000/acre)");
  const [water, setWater] = useState("High (Tubewell + Canal)");
  const [prevCrop, setPrevCrop] = useState("Wheat");

  // Fertilizer Form Inputs
  const [fCrop, setFCrop] = useState("Tomato");
  const [fSoil, setFSoil] = useState("Sandy Loam");
  const [fStage, setFStage] = useState("Vegetative Stage");

  // Irrigation Calculator Inputs
  const [irrCrop, setIrrCrop] = useState("Rice");
  const [irrArea, setIrrArea] = useState(2);
  const [irrStage, setIrrStage] = useState("Active Tillering");
  const [irrResult, setIrrResult] = useState<any>(null);

  const handleRecommendCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCropResult(null);

    try {
      const response = await fetch("/api/crop-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          season,
          soilType,
          budget,
          waterAvailability: water,
          previousCrop: prevCrop
        })
      });
      const data = await response.json();
      setCropResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFertilizerResult(null);

    try {
      const response = await fetch("/api/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: fCrop,
          soilType: fSoil,
          stage: fStage
        })
      });
      const data = await response.json();
      setFertilizerResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateIrrigation = (e: React.FormEvent) => {
    e.preventDefault();
    // Deterministic agronomic water calculator model
    const waterFactors: Record<string, number> = {
      Rice: 15.0, // Liters per sq meter per day
      Wheat: 6.5,
      Tomato: 8.0,
      Maize: 7.0,
      Cotton: 9.5
    };

    const stageModifiers: Record<string, number> = {
      "Sowing Stage": 0.6,
      "Active Tillering": 1.1,
      "Flowering Stage": 1.3,
      "Fruit Setting": 1.2,
      "Harvest Ready": 0.3
    };

    const cropFactor = waterFactors[irrCrop] || 7.5;
    const stageFactor = stageModifiers[irrStage] || 1.0;

    // 1 Acre = 4047 Square Meters
    const areaSqM = irrArea * 4047;
    const dailyWaterReqLiters = Math.round(areaSqM * cropFactor * stageFactor);
    const weeklyWaterReqLiters = dailyWaterReqLiters * 7;

    setIrrResult({
      daily: dailyWaterReqLiters,
      weekly: weeklyWaterReqLiters,
      schedule: [
        `Deliver ${Math.round(dailyWaterReqLiters / 2).toLocaleString()} litres twice daily: once before 7:30 AM and once after 5:30 PM.`,
        "Check soil moisture to a depth of 5 cm. If the soil clings together, delay the next cycle.",
        "Spread water evenly and avoid standing pools, which encourage fungal disease."
      ],
      savingTips: [
        "Switching to drip irrigation can cut evaporation loss by up to 45%.",
        "Lay straw or plastic mulch on the beds to hold moisture in the soil.",
        "Store monsoon runoff in a sump to supplement irrigation later in the season."
      ]
    });
  };

  const subTabs = [
    { id: "crop" as const, label: "Crop match", Icon: Wheat },
    { id: "irrigation" as const, label: "Irrigation plan", Icon: Droplets },
    { id: "fertilizer" as const, label: "Fertilizer plan", Icon: Sprout }
  ];

  // Budget tiles get a proportional fill bar when the values are numeric
  const budgetEntries = Object.entries(cropResult?.budgetAllocation || {});
  const budgetAmounts = budgetEntries.map(([, v]) => parseAmount(v));
  const budgetTotal = budgetAmounts.every((n) => Number.isFinite(n)) ? budgetAmounts.reduce((a, b) => a + b, 0) : 0;

  const contentKey = loading && activeSubTab !== "irrigation" ? "loading" : activeSubTab;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <AdvisorIcon className="w-6 h-6" animate />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Planning</span>
          <h2 className="text-3xl text-slate-900">Crop Advisor</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Get crop, fertilizer and irrigation recommendations matched to your soil, season, water supply and budget.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none">
        {subTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium shrink-0 transition-colors cursor-pointer ${
              activeSubTab === id ? "text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeSubTab === id && (
              <motion.span
                layoutId="ai-advisor-tab-underline"
                className="absolute left-2 right-2 -bottom-px h-0.5 bg-emerald-700 rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content (wrapper stays static; inner panels swap with motion) */}
      <div>
        <AnimatePresence mode="wait" initial={false}>
          {contentKey === "loading" && (
            <motion.div key="loading" {...tabSwap}>
              <AIThinking />
            </motion.div>
          )}

          {/* 1. Crop match */}
          {contentKey === "crop" && (
            <motion.div key="crop" {...tabSwap} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className={`lg:col-span-2 ${cardClass} p-6 space-y-5 self-start`}>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Your field</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tell us about the plot and we will suggest the best-fit crop.</p>
                </div>
                <motion.form onSubmit={handleRecommendCrop} variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                  <Field label="Location">
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Season">
                      <select value={season} onChange={(e) => setSeason(e.target.value)} className={inputClass}>
                        <option value="Kharif (Monsoon)">Kharif (Monsoon)</option>
                        <option value="Rabi (Winter)">Rabi (Winter)</option>
                        <option value="Zaid (Summer)">Zaid (Summer)</option>
                      </select>
                    </Field>

                    <Field label="Soil type">
                      <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={inputClass}>
                        <option value="Clay Loam">Clay Loam (Rich Humus)</option>
                        <option value="Alluvial Soil">Alluvial Soil</option>
                        <option value="Black Soil">Black Cotton Soil</option>
                        <option value="Sandy Soil">Sandy Soil</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Water availability">
                    <select value={water} onChange={(e) => setWater(e.target.value)} className={inputClass}>
                      <option value="High (Tubewell + Canal)">High (Tubewell + Canal)</option>
                      <option value="Medium (Borewell)">Medium (Borewell)</option>
                      <option value="Low (Rainfed)">Low (Rainfed)</option>
                    </select>
                  </Field>

                  <Field label="Previous crop">
                    <input type="text" value={prevCrop} onChange={(e) => setPrevCrop(e.target.value)} className={inputClass} />
                  </Field>

                  <motion.div variants={riseItem} className="pt-1">
                    <button type="submit" className={primaryButtonClass}>
                      Recommend a crop
                      <ArrowIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                </motion.form>
              </div>

              <div className="lg:col-span-3 space-y-6">
                {cropResult ? (
                  <motion.div variants={resultCard} initial="hidden" animate="show">
                    <div className={`${cardClass} p-6 space-y-6`}>
                      {/* Headline */}
                      <motion.div variants={riseItem} className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <SeedIcon className="w-5 h-5" animate />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-500">Recommended crop</span>
                            <h4 className="text-2xl font-display font-semibold text-slate-900 leading-tight mt-0.5">{cropResult.bestCrop}</h4>
                          </div>
                        </div>
                        {cropResult.isMock && <MockBadge />}
                      </motion.div>

                      {/* Key metrics */}
                      <motion.div variants={riseItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                          <span className="text-xs font-medium text-slate-500 block">Expected yield</span>
                          <span className="text-lg font-semibold text-slate-900 tabular-nums block mt-1">{cropResult.expectedYield}</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                          <span className="text-xs font-medium text-emerald-800 block">Expected net profit</span>
                          <span className="text-lg font-semibold text-emerald-800 tabular-nums block mt-1">{cropResult.expectedProfit}</span>
                        </div>
                      </motion.div>

                      {/* Growing tips */}
                      {cropResult.growingTips?.length > 0 && (
                        <motion.div variants={riseItem} className="space-y-3">
                          <SectionTitle icon={<ListChecks className="w-4 h-4" />}>How to grow it</SectionTitle>
                          <motion.ol variants={listContainer} className="space-y-2.5">
                            {cropResult.growingTips.map((tip: string, idx: number) => (
                              <motion.li key={idx} variants={listItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center tabular-nums mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{tip}</span>
                              </motion.li>
                            ))}
                          </motion.ol>
                        </motion.div>
                      )}

                      {/* Budget */}
                      {budgetEntries.length > 0 && (
                        <motion.div variants={riseItem} className="space-y-3 pt-5 border-t border-slate-100">
                          <SectionTitle icon={<Wallet className="w-4 h-4" />}>Suggested budget per acre</SectionTitle>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {budgetEntries.map(([key, value], idx) => (
                              <div key={key} className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="text-xs font-medium text-slate-500 capitalize truncate">{key}</span>
                                  <span className="text-sm font-semibold text-slate-900 tabular-nums">{value as string}</span>
                                </div>
                                {budgetTotal > 0 && (
                                  <div className="h-1 w-full bg-slate-200/70 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(budgetAmounts[idx] / budgetTotal) * 100}%` }}
                                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                      className="h-full bg-emerald-600 rounded-full"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Alternatives */}
                      {cropResult.alternatives?.length > 0 && (
                        <motion.div variants={riseItem} className="space-y-3 pt-5 border-t border-slate-100">
                          <SectionTitle icon={<Shuffle className="w-4 h-4" />}>Other good options</SectionTitle>
                          <div className="flex flex-wrap gap-2">
                            {cropResult.alternatives.map((alt: string, idx: number) => (
                              <span key={idx} className="text-sm bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <EmptyState
                    icon={<SeedIcon className="w-6 h-6" />}
                    title="No recommendation yet"
                    body="Fill in your field details and select Recommend a crop to see the best fit, expected returns and a budget breakdown."
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* 2. Irrigation plan */}
          {contentKey === "irrigation" && (
            <motion.div key="irrigation" {...tabSwap} className="space-y-6">
              {loading && <AIThinking />}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className={`lg:col-span-2 ${cardClass} p-6 space-y-5 self-start`}>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Your plot</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Estimates daily and weekly water needs for the crop stage.</p>
                  </div>
                  <motion.form onSubmit={handleCalculateIrrigation} variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                    <Field label="Crop">
                      <select value={irrCrop} onChange={(e) => setIrrCrop(e.target.value)} className={inputClass}>
                        <option value="Rice">Rice (Paddy)</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Tomato">Tomato</option>
                        <option value="Maize">Maize (Corn)</option>
                        <option value="Cotton">Cotton</option>
                      </select>
                    </Field>

                    <Field label="Area (acres)">
                      <input
                        type="number"
                        step="0.1"
                        value={irrArea}
                        onChange={(e) => setIrrArea(parseFloat(e.target.value))}
                        className={`${inputClass} tabular-nums`}
                      />
                    </Field>

                    <Field label="Growth stage">
                      <select value={irrStage} onChange={(e) => setIrrStage(e.target.value)} className={inputClass}>
                        <option value="Sowing Stage">Sowing Stage</option>
                        <option value="Active Tillering">Active Tillering (Vegetative)</option>
                        <option value="Flowering Stage">Flowering Stage</option>
                        <option value="Fruit Setting">Fruit Setting / Grain Fill</option>
                        <option value="Harvest Ready">Harvest Ready</option>
                      </select>
                    </Field>

                    <motion.div variants={riseItem} className="pt-1">
                      <button type="submit" className={primaryButtonClass}>
                        Calculate water needs
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </motion.form>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  {irrResult ? (
                    <motion.div key={`${irrResult.daily}-${irrResult.weekly}`} variants={resultCard} initial="hidden" animate="show">
                      <div className={`${cardClass} p-6 space-y-6`}>
                        <motion.div variants={riseItem} className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <RainIcon className="w-5 h-5" animate />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-500">Irrigation estimate</span>
                            <h4 className="text-2xl font-display font-semibold text-slate-900 leading-tight mt-0.5">
                              {irrCrop}, {irrArea} {irrArea === 1 ? "acre" : "acres"}
                            </h4>
                          </div>
                        </motion.div>

                        <motion.div variants={riseItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4">
                            <span className="text-xs font-medium text-sky-800 block">Water per day</span>
                            <span className="text-2xl font-semibold text-sky-900 tabular-nums block mt-1">
                              {Number.isFinite(irrResult.daily) ? <CountUp to={irrResult.daily} duration={1} /> : irrResult.daily?.toLocaleString()}
                              <span className="text-sm font-medium text-sky-700 ml-1">litres</span>
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                            <span className="text-xs font-medium text-slate-500 block">Water per week</span>
                            <span className="text-2xl font-semibold text-slate-900 tabular-nums block mt-1">
                              {Number.isFinite(irrResult.weekly) ? <CountUp to={irrResult.weekly} duration={1.2} /> : irrResult.weekly?.toLocaleString()}
                              <span className="text-sm font-medium text-slate-500 ml-1">litres</span>
                            </span>
                          </div>
                        </motion.div>

                        <motion.div variants={riseItem} className="space-y-3">
                          <SectionTitle icon={<ListChecks className="w-4 h-4" />}>Watering schedule</SectionTitle>
                          <motion.ul variants={listContainer} className="space-y-2.5">
                            {irrResult.schedule?.map((sch: string, idx: number) => (
                              <motion.li key={idx} variants={listItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-2" />
                                <span>{sch}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </motion.div>

                        <motion.div variants={riseItem} className="space-y-3 pt-5 border-t border-slate-100">
                          <SectionTitle icon={<Droplets className="w-4 h-4" />}>Ways to save water</SectionTitle>
                          <motion.ul variants={listContainer} className="space-y-2.5">
                            {irrResult.savingTips?.map((tip: string, idx: number) => (
                              <motion.li key={idx} variants={listItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                                <span>{tip}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <EmptyState
                      icon={<RainIcon className="w-6 h-6" />}
                      title="No estimate yet"
                      body="Choose your crop, area and growth stage, then select Calculate water needs."
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. Fertilizer plan */}
          {contentKey === "fertilizer" && (
            <motion.div key="fertilizer" {...tabSwap} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className={`lg:col-span-2 ${cardClass} p-6 space-y-5 self-start`}>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Your crop</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Get a fertilizer, dosage and timing suited to the growth stage.</p>
                </div>
                <motion.form onSubmit={handleRecommendFertilizer} variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                  <Field label="Crop">
                    <input type="text" value={fCrop} onChange={(e) => setFCrop(e.target.value)} className={inputClass} />
                  </Field>

                  <Field label="Soil type">
                    <select value={fSoil} onChange={(e) => setFSoil(e.target.value)} className={inputClass}>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Black Soil">Black Cotton Soil</option>
                    </select>
                  </Field>

                  <Field label="Growth stage">
                    <select value={fStage} onChange={(e) => setFStage(e.target.value)} className={inputClass}>
                      <option value="Vegetative Stage">Vegetative Growth Stage</option>
                      <option value="Flowering Phase">Flowering Phase</option>
                      <option value="Fruit Settling Stage">Fruit Settling Stage</option>
                    </select>
                  </Field>

                  <motion.div variants={riseItem} className="pt-1">
                    <button type="submit" className={primaryButtonClass}>
                      Get fertilizer plan
                      <ArrowIcon className="w-4 h-4" />
                    </button>
                  </motion.div>
                </motion.form>
              </div>

              <div className="lg:col-span-3 space-y-6">
                {fertilizerResult ? (
                  <motion.div variants={resultCard} initial="hidden" animate="show">
                    <div className={`${cardClass} p-6 space-y-6`}>
                      <motion.div variants={riseItem} className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Sprout className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-500">Recommended fertilizer</span>
                            <h4 className="text-xl font-display font-semibold text-slate-900 leading-snug mt-0.5">
                              {fertilizerResult.recommendedFertilizer}
                            </h4>
                          </div>
                        </div>
                        {fertilizerResult.isMock && <MockBadge />}
                      </motion.div>

                      <motion.div variants={riseItem} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
                        <span className="text-xs font-medium text-slate-500 block">Dosage</span>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums block mt-1">{fertilizerResult.quantity}</span>
                      </motion.div>

                      <motion.div variants={riseItem} className="space-y-3">
                        <SectionTitle icon={<ListChecks className="w-4 h-4" />}>When to apply</SectionTitle>
                        <motion.ol variants={listContainer} className="space-y-2.5">
                          {fertilizerResult.schedule?.map((sch: string, idx: number) => (
                            <motion.li key={idx} variants={listItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                              <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center tabular-nums mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{sch}</span>
                            </motion.li>
                          ))}
                        </motion.ol>
                      </motion.div>

                      <motion.div variants={riseItem} className="space-y-3 pt-5 border-t border-slate-100">
                        <SectionTitle icon={<Leaf className="w-4 h-4" />}>Organic alternatives</SectionTitle>
                        <motion.ul variants={listContainer} className="space-y-2.5">
                          {fertilizerResult.organicAlternatives?.map((alt: string, idx: number) => (
                            <motion.li key={idx} variants={listItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                              <span>{alt}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <EmptyState
                    icon={<Sprout className="w-6 h-6" />}
                    title="No fertilizer plan yet"
                    body="Enter your crop, soil and growth stage, then select Get fertilizer plan for NPK guidance and organic options."
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
