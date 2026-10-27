/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Farm, Crop, CropGrowthStage } from "../types";
import { Trash2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform, Variants } from "motion/react";
import { staggerContainer, riseItem } from "./MotionKit";
import { CalendarIcon, PlusIcon, SeedIcon, PlotsIcon } from "./icons";

interface CropModuleProps {
  farms: Farm[];
  crops: Crop[];
  onAddCrop: (crop: Crop) => void;
  onUpdateCropStage: (id: string, stage: CropGrowthStage) => void;
  onDeleteCrop: (id: string) => void;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

// Form fields cascade in once the panel has opened
const formFields: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } }
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeOut } }
};

// Number that springs to its new value whenever it changes
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20, mass: 0.8 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "text-xs font-medium text-slate-600";

// Short labels for the stage stepper
const stageShort: Record<CropGrowthStage, string> = {
  [CropGrowthStage.SOWING]: "Sown",
  [CropGrowthStage.VEGETATIVE]: "Growing",
  [CropGrowthStage.FLOWERING]: "Flowering",
  [CropGrowthStage.HARVEST_READY]: "Ready",
  [CropGrowthStage.HARVESTED]: "Harvested"
};

export default function CropModule({ farms, crops, onAddCrop, onUpdateCropStage, onDeleteCrop }: CropModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [farmId, setFarmId] = useState("");
  const [name, setName] = useState("");
  const [variety, setVariety] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [expectedProfit, setExpectedProfit] = useState(15000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || !name || !variety || !sowingDate || !expectedHarvestDate) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const newCrop: Crop = {
      id: "crop-" + Math.random().toString(36).substr(2, 9),
      farmId,
      name,
      variety,
      sowingDate,
      growthStage: CropGrowthStage.SOWING,
      expectedHarvestDate,
      yieldPredictionQuintals: Math.floor(Math.random() * 15) + 12, // simulated range
      expectedProfit,
      notes: "Auto-registered on plant grid"
    };

    onAddCrop(newCrop);
    setName("");
    setVariety("");
    setSowingDate("");
    setExpectedHarvestDate("");
    setExpectedProfit(15000);
    setShowAddForm(false);
  };

  const getFarmName = (fId: string) => {
    const f = farms.find(farm => farm.id === fId);
    return f ? f.name : "Unassigned Plot";
  };

  const stageColors: Record<CropGrowthStage, string> = {
    [CropGrowthStage.SOWING]: "bg-slate-100 text-slate-700",
    [CropGrowthStage.VEGETATIVE]: "bg-emerald-50 text-emerald-700",
    [CropGrowthStage.FLOWERING]: "bg-harvest-50 text-harvest-600",
    [CropGrowthStage.HARVEST_READY]: "bg-harvest-100 text-soil-500",
    [CropGrowthStage.HARVESTED]: "bg-slate-100 text-slate-500"
  };

  const stages = Object.values(CropGrowthStage);

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" animate />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Season planning</span>
            <h2 className="text-3xl text-slate-900 mt-0.5">Crop Calendar</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Track every crop from sowing to harvest and update its growth stage as it progresses.
            </p>
          </div>
        </div>
        {farms.length > 0 && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer shrink-0 self-start md:self-auto ${
              showAddForm
                ? "bg-white border border-slate-200 hover:border-slate-300 text-slate-700"
                : "bg-emerald-700 hover:bg-emerald-800 text-white"
            }`}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
            {showAddForm ? "Cancel" : "Add crop"}
          </button>
        )}
      </div>

      {farms.length === 0 && (
        <div className="bg-harvest-50 border border-harvest-100 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-harvest-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">Add a farm plot first</p>
            <p className="mt-1 text-slate-600">Each crop is planted on a plot. Register at least one plot under Farm Plots, then come back here to add crops.</p>
          </div>
        </div>
      )}

      {/* Add Crop Form */}
      <AnimatePresence initial={false}>
        {showAddForm && farms.length > 0 && (
          <motion.div
            key="crop-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden -mx-2 px-2 py-1"
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-3xl">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900">New crop</h3>
                <p className="text-xs text-slate-500 mt-0.5">All fields are required. The crop starts at the sowing stage.</p>
              </div>
              <motion.form
                onSubmit={handleSubmit}
                variants={formFields}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Plot</label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Choose a plot</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.areaAcres} ac)</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Crop name</label>
                  <input
                    type="text"
                    placeholder="e.g. Basmati Rice, Yellow Mustard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Seed variety</label>
                  <input
                    type="text"
                    placeholder="e.g. PB-1121, Pusa Hybrid"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Expected profit (₹)</label>
                  <input
                    type="number"
                    value={expectedProfit}
                    onChange={(e) => setExpectedProfit(parseInt(e.target.value))}
                    className={`${inputClass} tabular-nums`}
                    required
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Sowing date</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Expected harvest date</label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className={inputClass}
                    required
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Save crop
                  </button>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crops List Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {crops.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl py-14 px-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <SeedIcon className="w-6 h-6" animate />
              </div>
              <p className="text-sm font-semibold text-slate-900">No crops yet</p>
              <p className="text-sm text-slate-500 mt-1">Add a crop to follow its growth stages and expected harvest.</p>
              {farms.length > 0 && !showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add crop
                </button>
              )}
            </motion.div>
          ) : (
            crops.map((c) => {
              const stageIdx = Math.max(0, stages.indexOf(c.growthStage));
              return (
                // Outer wrapper owns motion transforms so the CSS card hover-lift on the inner card keeps working
                <motion.div
                  key={c.id}
                  layout
                  variants={riseItem}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <div className="h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-[box-shadow,border-color] flex flex-col gap-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <SeedIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-base truncate">{c.name}</h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <PlotsIcon className="w-3.5 h-3.5 text-slate-400" mono /> {getFarmName(c.farmId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={c.growthStage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${stageColors[c.growthStage]}`}
                          >
                            {c.growthStage}
                          </motion.span>
                        </AnimatePresence>
                        <button
                          onClick={() => onDeleteCrop(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove crop"
                          aria-label={`Remove ${c.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Growth stage stepper */}
                    <div>
                      <span className="text-xs text-slate-500 block mb-2">Growth stage</span>
                      <div className="grid grid-cols-5 gap-1 bg-slate-100 rounded-xl p-1">
                        {stages.map((stage, i) => {
                          const active = c.growthStage === stage;
                          const passed = i < stageIdx;
                          return (
                            <button
                              key={stage}
                              onClick={() => onUpdateCropStage(c.id, stage)}
                              title={stage}
                              className={`relative text-[11px] sm:text-xs font-medium px-1 py-2 rounded-lg transition-colors cursor-pointer truncate ${
                                active ? "text-white" : passed ? "text-emerald-700 hover:bg-white/70" : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                              }`}
                            >
                              {/* Shared highlight glides between stages */}
                              {active && (
                                <motion.span
                                  layoutId={`stage-pill-${c.id}`}
                                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                  className="absolute inset-0 rounded-lg bg-emerald-700 shadow-sm"
                                />
                              )}
                              <span className="relative">{stageShort[stage]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details */}
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-500">Variety</dt>
                        <dd className="font-medium text-slate-800 truncate mt-0.5">{c.variety}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Estimated yield</dt>
                        <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">
                          <AnimatedNumber value={c.yieldPredictionQuintals} /> qtl / acre
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Sown</dt>
                        <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">{c.sowingDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Expected harvest</dt>
                        <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">{c.expectedHarvestDate}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="text-xs text-slate-500">Expected profit</span>
                      <span className="text-lg font-semibold text-emerald-700 tabular-nums">
                        {c.expectedProfit != null ? (
                          <>₹<AnimatedNumber value={c.expectedProfit} /></>
                        ) : (
                          <span className="text-slate-400 text-sm font-medium">Not set</span>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
