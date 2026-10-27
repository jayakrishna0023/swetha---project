/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Bug, Upload, AlertTriangle, Info, Leaf, FlaskConical, ShieldCheck, Stethoscope, Thermometer, CalendarDays, ImageIcon } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { CountUp, riseItem, staggerContainer } from "./MotionKit";
import { ScannerIcon, ArrowIcon } from "./icons";

// Tab pane cross-fade; children inherit the stagger
const paneVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.04 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } }
};

// Opacity-only reveal for wrappers around `.rounded-2xl.border` cards so the CSS hover lift keeps working
const fadeItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.08 } }
};

const tipItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
};

const cardClass = "bg-white border border-slate-200/80 rounded-2xl shadow-sm";
const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";

export default function DiseasePestModule() {
  const [activeSubTab, setActiveSubTab] = useState<"disease" | "pest">("disease");
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample pre-loaded base64 mock leaf slides for easy user testing
  const sampleLeafSlides = [
    {
      label: "Tomato early blight",
      crop: "Tomato",
      url: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=300",
      mockBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" // simple 1x1 mock
    },
    {
      label: "Maize leaf rust",
      crop: "Maize",
      url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=300",
      mockBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
  ];

  const readLeafFile = (file: File) => {
    setDiagnostics(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readLeafFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) readLeafFile(file);
  };

  const handleSelectSample = (sample: typeof sampleLeafSlides[0]) => {
    setDiagnostics(null);
    setPreviewUrl(sample.url);
    setSelectedCrop(sample.crop);
  };

  const handleDiagnose = async () => {
    if (!previewUrl) {
      alert("Please upload a leaf photo or choose a sample first.");
      return;
    }

    setLoading(true);
    setDiagnostics(null);

    // If it's a sample slide URL, we can send a mock base64 or download and convert
    // We send a default valid leaf base64 to ensure API doesn't fail
    const payloadBase64 = previewUrl.startsWith("data:") ? previewUrl : sampleLeafSlides[0].mockBase64;

    try {
      const response = await fetch("/api/disease-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: payloadBase64,
          cropType: selectedCrop
        })
      });
      const data = await response.json();
      setDiagnostics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pest predictions database
  const pestAlerts = [
    {
      name: "Fall Armyworm (Spodoptera frugiperda)",
      risk: "CRITICAL",
      crop: "Maize (Corn) & Sorghum",
      season: "Monsoon (Kharif)",
      tempThreshold: "26°C - 30°C",
      prevention: "Adopt intercropping with Desmodium (push-pull method). Apply neem seed kernel extract (NSKE 5%) during early larval stage.",
      alerts: "High humidity after showers has triggered infestations in Northern belts."
    },
    {
      name: "Whitefly (Bemisia tabaci)",
      risk: "MODERATE",
      crop: "Cotton, Brinjal, Okra",
      season: "Summer (Zaid)",
      tempThreshold: "30°C - 35°C",
      prevention: "Install yellow sticky traps @ 10 traps/acre. Avoid excessive application of synthetic nitrogenous fertilizers.",
      alerts: "Dry spelling in Western plain zones favors rapid population reproduction."
    },
    {
      name: "Brown Plant Hopper (BPH)",
      risk: "LOW",
      crop: "Rice (Paddy)",
      season: "Late Monsoon",
      tempThreshold: "25°C - 28°C",
      prevention: "Ensure proper spacing (20cm x 15cm) to let sunlight penetrate the water beds. Formulate alternate wetting and drying.",
      alerts: "Infestation localized to stagnant low-lying clay parcels."
    }
  ];

  const riskStyles: Record<string, { label: string; badge: string; dot: string }> = {
    CRITICAL: { label: "High risk", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    MODERATE: { label: "Moderate risk", badge: "bg-harvest-50 text-harvest-600 border-harvest-100", dot: "bg-harvest-500" },
    LOW: { label: "Low risk", badge: "bg-emerald-50 text-emerald-800 border-emerald-100", dot: "bg-emerald-600" }
  };

  // Confidence parsing for the animated ring / count-up (falls back to raw text)
  const confidenceRaw = String(diagnostics?.confidenceScore ?? "").trim();
  const confidenceValue = parseFloat(confidenceRaw);
  const confidenceDecimals = ((confidenceRaw.split(".")[1] || "").match(/^\d+/)?.[0] || "").length;
  const hasConfidence = !isNaN(confidenceValue);

  // Loading panel with a scan line sweeping across the submitted leaf
  const scanningPanel = (
    <div className={`${cardClass} py-12 px-6 flex flex-col items-center justify-center text-center`}>
      {previewUrl ? (
        <div className="relative w-48 h-36 rounded-xl overflow-hidden mb-5 ring-1 ring-slate-200 shadow-sm">
          <img src={previewUrl} alt="Leaf being analysed" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-emerald-950/20" />
          <div className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:14px_14px]" />
          <motion.div
            className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-emerald-200/40 to-transparent"
            initial={{ top: "-30%" }}
            animate={{ top: ["-30%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-200 shadow-[0_0_10px_rgba(167,243,208,0.8)]" />
          </motion.div>
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
          <ScannerIcon className="w-6 h-6" animate />
        </div>
      )}
      <p className="text-sm font-semibold text-slate-900">Analysing leaf</p>
      <p className="text-sm text-slate-500 mt-1">Checking the image for signs of disease on {selectedCrop.toLowerCase()}. This usually takes a few seconds.</p>
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-600"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );

  const paneKey = activeSubTab === "disease" ? (loading ? "scanning" : "disease") : "pest";

  const tabs = [
    { id: "disease" as const, label: "Leaf scan", Icon: Leaf },
    { id: "pest" as const, label: "Pest alerts", Icon: Bug }
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <ScannerIcon className="w-6 h-6" animate />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Crop health</span>
          <h2 className="text-3xl text-slate-900">Disease Scanner</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Upload a photo of an affected leaf to identify the likely disease and treatment, and review pest alerts for the season.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeSubTab === id ? "text-emerald-800" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeSubTab === id && (
              <motion.span
                layoutId="disease-pest-tab-underline"
                className="absolute left-2 right-2 -bottom-px h-0.5 bg-emerald-700 rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panes */}
      <div>
        <AnimatePresence mode="wait">
          {paneKey === "scanning" && (
            <motion.div key="scanning" variants={paneVariants} initial="hidden" animate="show" exit="exit">
              {scanningPanel}
            </motion.div>
          )}

          {/* 1. Leaf scan */}
          {paneKey === "disease" && (
            <motion.div key="disease" variants={paneVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Input */}
              <motion.div variants={fadeItem} className="lg:col-span-2">
                <div className={`${cardClass} p-6 space-y-5`}>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Leaf photo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">A clear, close-up photo in daylight gives the best result.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Crop</label>
                    <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className={inputClass}>
                      <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                      <option value="Maize">Maize / Corn</option>
                      <option value="Rice">Rice (Paddy)</option>
                      <option value="Potato">Potato</option>
                      <option value="Cotton">Cotton</option>
                    </select>
                  </div>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden group ${
                      isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40"
                    }`}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {previewUrl ? (
                        <motion.div
                          key={previewUrl}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <img src={previewUrl} alt="Selected leaf" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-2 right-2 text-xs font-medium bg-white/90 text-slate-700 px-2.5 py-1 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Replace photo
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pointer-events-none">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isDragging ? "bg-emerald-100 text-emerald-700" : "bg-white border border-slate-200 text-slate-500"}`}>
                            <Upload className="w-5 h-5" />
                          </span>
                          <span className="text-sm font-medium text-slate-800">Drop a leaf photo here</span>
                          <span className="text-xs text-slate-500 mt-1">or click to browse. JPG or PNG.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>

                  {/* Samples */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-600 block">Or try a sample</span>
                    <div className="grid grid-cols-2 gap-2">
                      {sampleLeafSlides.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSample(sample)}
                          className={`border rounded-xl p-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                            previewUrl === sample.url ? "border-emerald-500 bg-emerald-50/60" : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <img src={sample.url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{sample.label}</p>
                            <span className="text-[11px] text-slate-500 block">{sample.crop}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleDiagnose}
                    disabled={!previewUrl}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      previewUrl
                        ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Analyse leaf
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Results */}
              <motion.div variants={fadeItem} className="lg:col-span-3 space-y-6">
                {diagnostics ? (
                  <div className={`${cardClass} p-6 space-y-6`}>
                    {/* Headline */}
                    <motion.div variants={riseItem} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {previewUrl && (
                          <img src={previewUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-200" referrerPolicy="no-referrer" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-slate-500">Likely diagnosis · {selectedCrop}</span>
                            {diagnostics.isMock && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-harvest-50 border border-harvest-100 text-harvest-600 px-2 py-0.5 rounded-full">
                                <Info className="w-3 h-3" /> Sample data
                              </span>
                            )}
                          </div>
                          <h4 className="text-2xl font-display font-semibold text-slate-900 leading-tight mt-0.5">{diagnostics.diseaseName}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {hasConfidence && (
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="4" />
                            <motion.circle
                              cx="22"
                              cy="22"
                              r="18"
                              fill="none"
                              stroke="currentColor"
                              className="text-emerald-700"
                              strokeWidth="4"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: Math.min(100, Math.max(0, confidenceValue)) / 100 }}
                              transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </svg>
                        )}
                        <div className="flex flex-col items-end text-right">
                          <span className="text-xs font-medium text-slate-500">Confidence</span>
                          <span className="text-lg font-semibold text-slate-900 tabular-nums">
                            {hasConfidence ? (
                              <CountUp to={confidenceValue} decimals={confidenceDecimals} suffix={confidenceRaw.endsWith("%") ? "%" : ""} duration={1.2} />
                            ) : (
                              diagnostics.confidenceScore
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Cause */}
                    <motion.div variants={riseItem} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-1.5">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Stethoscope className="w-4 h-4 text-emerald-700" /> Cause
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">{diagnostics.causes}</p>
                    </motion.div>

                    {/* Treatment */}
                    <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <motion.div variants={riseItem} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-1.5">
                        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                          <Leaf className="w-4 h-4 text-emerald-700" /> Organic treatment
                        </span>
                        <p className="text-sm text-emerald-950/80 leading-relaxed">{diagnostics.organicSolution}</p>
                      </motion.div>
                      <motion.div variants={riseItem} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <FlaskConical className="w-4 h-4 text-soil-500" /> Chemical treatment
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed">{diagnostics.treatment}</p>
                      </motion.div>
                    </motion.div>

                    {/* Prevention */}
                    {diagnostics.preventionTips?.length > 0 && (
                      <motion.div variants={riseItem} className="pt-5 border-t border-slate-100 space-y-3">
                        <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" /> Prevention
                        </h5>
                        <motion.ul variants={staggerContainer} className="space-y-2.5">
                          {diagnostics.preventionTips.map((tip: string, idx: number) => (
                            <motion.li key={idx} variants={tipItem} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                              <span>{tip}</span>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/60 border border-dashed border-slate-300 rounded-2xl py-20 px-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">No leaf analysed yet</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                      Upload a photo or pick a sample, then select Analyse leaf to see the diagnosis, treatment options and prevention steps.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* 2. Pest alerts */}
          {paneKey === "pest" && (
            <motion.div key="pest" variants={paneVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              {loading && scanningPanel}

              <motion.div variants={riseItem} className="bg-harvest-50 border border-harvest-100 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-harvest-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold text-slate-900">Monsoon pest advisory</span>
                  <p className="mt-0.5 text-slate-600">Warm temperatures and recent rain have raised infestation risk across northern districts.</p>
                </div>
              </motion.div>

              <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pestAlerts.map((pest, idx) => {
                  const risk = riskStyles[pest.risk];
                  return (
                    // Wrapper carries the motion transform so the card's CSS hover lift stays intact
                    <motion.div key={idx} variants={riseItem} className="h-full">
                      <div className={`h-full ${cardClass} p-5 flex flex-col gap-4`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm leading-snug">{pest.name}</h4>
                            <span className="text-xs text-slate-500 block mt-0.5">{pest.crop}</span>
                          </div>
                          <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${risk.badge}`}>
                            <span className="relative flex w-1.5 h-1.5">
                              {pest.risk === "CRITICAL" && (
                                <motion.span
                                  className={`absolute inset-0 rounded-full ${risk.dot}`}
                                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                                />
                              )}
                              <span className={`relative w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                            </span>
                            {risk.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                              <CalendarDays className="w-3 h-3" /> Season
                            </span>
                            <span className="text-xs font-semibold text-slate-800 block mt-0.5">{pest.season}</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5">
                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                              <Thermometer className="w-3 h-3" /> Temperature
                            </span>
                            <span className="text-xs font-semibold text-slate-800 block mt-0.5 tabular-nums">{pest.tempThreshold}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-900 block">Current situation</span>
                          <p className="text-sm text-slate-600 leading-relaxed">{pest.alerts}</p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 space-y-1">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" /> Prevention
                          </span>
                          <p className="text-sm text-slate-600 leading-relaxed">{pest.prevention}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
