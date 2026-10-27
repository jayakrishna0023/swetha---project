/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Farm } from "../types";
import { MapPin, Droplets, Ruler, Layers, Trash2, X } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform, Variants } from "motion/react";
import { staggerContainer, riseItem } from "./MotionKit";
import { PlotsIcon, PlusIcon, SeedIcon } from "./icons";

interface FarmerModuleProps {
  farms: Farm[];
  onAddFarm: (farm: Farm) => void;
  onDeleteFarm: (id: string) => void;
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

// Crop rotation chips fade in one after another
const chipList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } }
};

const chipItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } }
};

// Acreage counter that springs to its new value whenever it changes
function AnimatedAcres({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 18, mass: 0.8 });
  const display = useTransform(spring, (v) => v.toLocaleString(undefined, { maximumFractionDigits: 2 }));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "text-xs font-medium text-slate-600";

export default function FarmerModule({ farms, onAddFarm, onDeleteFarm }: FarmerModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [soilType, setSoilType] = useState("Clay Loam");
  const [waterSource, setWaterSource] = useState("Tube-well + Canal");
  const [areaAcres, setAreaAcres] = useState(2.5);
  const [cropHistory, setCropHistory] = useState("");

  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      alert("Name and Location are required.");
      return;
    }

    const newFarm: Farm = {
      id: "farm-" + Math.random().toString(36).substr(2, 9),
      name,
      location,
      soilType,
      waterSource,
      areaAcres,
      cropHistory: cropHistory ? cropHistory.split(",").map(c => c.trim()) : ["None"],
      farmerId: "curr-farmer",
      createdAt: new Date().toLocaleDateString()
    };

    onAddFarm(newFarm);
    setName("");
    setLocation("");
    setSoilType("Clay Loam");
    setWaterSource("Tube-well + Canal");
    setAreaAcres(2.5);
    setCropHistory("");
    setShowAddForm(false);
  };

  const totalAcres = farms.reduce((sum, f) => sum + (Number.isFinite(f.areaAcres) ? f.areaAcres : 0), 0);

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <PlotsIcon className="w-6 h-6" animate />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Land records</span>
            <h2 className="text-3xl text-slate-900 mt-0.5">Farm Plots</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Keep a record of each plot: location, size, soil type, water source and crop history.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer shrink-0 self-start md:self-auto ${
            showAddForm
              ? "bg-white border border-slate-200 hover:border-slate-300 text-slate-700"
              : "bg-emerald-700 hover:bg-emerald-800 text-white"
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add plot"}
        </button>
      </div>

      {/* Summary strip */}
      {farms.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>
            <span className="font-semibold text-slate-900 tabular-nums">{farms.length}</span> {farms.length === 1 ? "plot" : "plots"}
          </span>
          <span>
            <span className="font-semibold text-slate-900 tabular-nums">
              <AnimatedAcres value={totalAcres} />
            </span>{" "}
            acres in total
          </span>
        </div>
      )}

      {/* Register Form */}
      <AnimatePresence initial={false}>
        {showAddForm && (
          <motion.div
            key="farm-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="overflow-hidden -mx-2 px-2 py-1"
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-3xl">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900">New plot</h3>
                <p className="text-xs text-slate-500 mt-0.5">Name and location are required. Everything else can be updated later.</p>
              </div>
              <motion.form
                onSubmit={handleAddPlot}
                variants={formFields}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Plot name</label>
                  <input
                    type="text"
                    placeholder="e.g. North Orchard"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Row 4, East Side"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Soil type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Alluvial Soil">Alluvial Soil (Silt & Loam)</option>
                    <option value="Black Soil">Black Cotton Soil (Heavy Clay)</option>
                    <option value="Red Soil">Red Sandy Soil (Iron Rich)</option>
                    <option value="Laterite Soil">Laterite Soil (Acidic/Alum)</option>
                    <option value="Clay Loam">Clay Loam (Rich Humus)</option>
                  </select>
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Water source</label>
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Canal Ingress">Canal Ingress</option>
                    <option value="Tube-well Sump">Tube-well Sump</option>
                    <option value="Borewell + Drip Line">Borewell + Drip Line</option>
                    <option value="Rainfed (Dryland)">Rainfed (Dryland)</option>
                    <option value="Mixed (Canal + Well)">Mixed (Canal + Well)</option>
                  </select>
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Area (acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(parseFloat(e.target.value))}
                    className={`${inputClass} tabular-nums`}
                  />
                </motion.div>

                <motion.div variants={fieldItem} className="space-y-1.5">
                  <label className={labelClass}>Previous crops <span className="text-slate-400 font-normal">(comma separated)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Mustard, Soybean"
                    value={cropHistory}
                    onChange={(e) => setCropHistory(e.target.value)}
                    className={inputClass}
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
                    Save plot
                  </button>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Farms List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {farms.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl py-14 px-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <PlotsIcon className="w-6 h-6" animate />
              </div>
              <p className="text-sm font-semibold text-slate-900">No plots yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first plot to start tracking crops and expenses against it.</p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add plot
                </button>
              )}
            </motion.div>
          ) : (
            farms.map((f) => (
              // Outer wrapper owns motion transforms so the CSS card hover-lift on the inner card keeps working
              <motion.div
                key={f.id}
                layout
                variants={riseItem}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <div className="group h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-[box-shadow,border-color] flex flex-col gap-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <PlotsIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 text-base truncate">{f.name}</h4>
                        <span className="text-xs text-slate-500">Added {f.createdAt}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteFarm(f.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete plot"
                      aria-label={`Delete ${f.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
                      </dt>
                      <dd className="font-medium text-slate-800 truncate mt-0.5">{f.location}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-slate-400" /> Area
                      </dt>
                      <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">
                        <AnimatedAcres value={f.areaAcres} /> acres
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" /> Soil
                      </dt>
                      <dd className="font-medium text-slate-800 truncate mt-0.5">{f.soilType}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-slate-400" /> Water
                      </dt>
                      <dd className="font-medium text-slate-800 truncate mt-0.5">{f.waterSource}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                      <SeedIcon className="w-3.5 h-3.5 text-slate-400" mono /> Crop history
                    </span>
                    <motion.div variants={chipList} initial="hidden" animate="show" className="flex flex-wrap gap-1.5">
                      {f.cropHistory.map((ch, idx) => (
                        <motion.span
                          key={idx}
                          variants={chipItem}
                          className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
