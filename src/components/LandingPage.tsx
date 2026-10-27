/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Sprout, ShieldCheck, Sun, DollarSign, BrainCircuit, Landmark, HelpCircle, ArrowRight, ChevronDown, TrendingUp, TrendingDown, Tractor, Wallet, Wheat, Bug, Bot, Quote, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdvisorIcon, ScannerIcon, WeatherIcon, LedgerIcon, MarketIcon, LearnIcon, PlotsIcon, SeedIcon, CalendarIcon, AssistantIcon, LogoMark } from "./icons";
import { Farm, Crop, Expense, CropGrowthStage } from "../types";
import { Reveal, CountUp, TiltCard, MagneticButton, AnimatedBar, staggerContainer, riseItem } from "./MotionKit";

interface LandingPageProps {
  farms: Farm[];
  crops: Crop[];
  expenses: Expense[];
  onNavigate: (tab: string) => void;
}

const DAY_MS = 86_400_000;

const features = [
  { icon: <AdvisorIcon className="w-6 h-6" />, tab: "ai", title: "Crop advisor", desc: "Crop, fertilizer and irrigation recommendations tailored to your soil, season, water and budget." },
  { icon: <ScannerIcon className="w-6 h-6" />, tab: "disease", title: "Disease scanner", desc: "Instant leaf scan to detect bacterial or fungal infections with biological and chemical solutions to protect your yield." },
  { icon: <WeatherIcon className="w-6 h-6" />, tab: "weather", title: "Live weather", desc: "A 7-day local forecast with field advice on spraying, irrigation and disease risk." },
  { icon: <LedgerIcon className="w-6 h-6" />, tab: "financial", title: "Expenses & profit", desc: "Record spending on seeds, fertilizer and labour, export to Excel, and forecast your return." },
  { icon: <MarketIcon className="w-6 h-6" />, tab: "marketplace", title: "Marketplace & rentals", desc: "Sell your harvest directly to verified buyers without middleman cuts. Rent out idle heavy machinery to neighboring farmers." },
  { icon: <LearnIcon className="w-6 h-6" />, tab: "academy", title: "Learning hub", desc: "Comprehensive database of regional government schemes, modern farming practices, and organic farming courses." }
];

const stats = [
  { label: "Active Farmers Registered", to: 14500, suffix: "+" },
  { label: "Acres Managed", to: 48000 },
  { label: "Average Farmer Income Increase", to: 34, prefix: "+", suffix: "%" },
  { label: "Water Saved Annually", to: 2.4, decimals: 1, suffix: "M L" }
];

const marketTicker = [
  { crop: "Wheat", mandi: "Ludhiana", price: 2475, change: 1.8 },
  { crop: "Basmati", mandi: "Karnal", price: 4210, change: 2.6 },
  { crop: "Soybean", mandi: "Indore", price: 4650, change: -0.9 },
  { crop: "Maize", mandi: "Davangere", price: 2190, change: 0.7 },
  { crop: "Chana", mandi: "Bhopal", price: 5320, change: -1.4 },
  { crop: "Cotton", mandi: "Rajkot", price: 7120, change: 3.1 },
  { crop: "Tomato", mandi: "Kolar", price: 1880, change: -4.2 },
  { crop: "Onion", mandi: "Lasalgaon", price: 2640, change: 5.3 }
];

const testimonials = [
  { initials: "RS", name: "Ramesh Sen", role: "Wheat & Lentil Farmer (District: Indore)", quote: "The Leaf Disease Scanner saved my lentil crop. Within 3 seconds of scanning, AgriSphere diagnosed Downey Mildew and recommended an organic Neem-oil wash. My fields recovered in a week." },
  { initials: "KP", name: "Kavitha Patel", role: "Tomato Greenhouse Owner (District: Pune)", quote: "Calculating exact water levels using the Smart Irrigation module reduced my water pump electrical bills by 22%. It factors in current growth stages so we don't overwater our clay loam beds." },
  { initials: "HS", name: "Harpreet Singh", role: "Durum Wheat Grower (District: Ludhiana)", quote: "I sold 3.5 tonnes of wheat straight to a flour mill through the Co-op Marketplace. No commission agent, and payment cleared in two days." }
];

const faqs = [
  { q: "How does the AI Crop Recommendation calculate crop suitability?", a: "AgriSphere evaluates soil type, season, water sources, budget constraints, and historical records with an AI model. It identifies crops that optimize expected profit while conserving soil nitrogen." },
  { q: "Do I need special high-end cameras for leaf scanning?", a: "No. Any standard smartphone camera or webcam capable of capturing clear images can scan plant foliage. Simply upload or capture an image of the affected crop leaf directly in the scanner." },
  { q: "How can I sell my crops directly on AgriSphere?", a: "As a registered farmer, navigate to the Marketplace page, list your crop with weight, expected price per kg, images, and contact information. Verified buyers can reach out to you directly." },
  { q: "Is my farm data saved?", a: "Yes. Farms, crops, expenses, listings and discussions are saved in this browser and survive reloads. Use 'Reset demo data' in the sidebar to start over." }
];

const quickActions = [
  { tab: "farms", label: "Register a plot", icon: <PlotsIcon className="w-[18px] h-[18px]" /> },
  { tab: "crops", label: "Log a new crop", icon: <CalendarIcon className="w-[18px] h-[18px]" /> },
  { tab: "financial", label: "Add an expense", icon: <LedgerIcon className="w-[18px] h-[18px]" /> },
  { tab: "disease", label: "Scan a leaf", icon: <ScannerIcon className="w-[18px] h-[18px]" /> },
  { tab: "chatbot", label: "Ask the AI assistant", icon: <AssistantIcon className="w-[18px] h-[18px]" /> }
];

const stageOrder = [CropGrowthStage.SOWING, CropGrowthStage.VEGETATIVE, CropGrowthStage.FLOWERING, CropGrowthStage.HARVEST_READY, CropGrowthStage.HARVESTED];

// Fraction of the sowing→harvest window that has elapsed
function cropProgress(crop: Crop) {
  const start = new Date(crop.sowingDate).getTime();
  const end = new Date(crop.expectedHarvestDate).getTime();
  if (crop.growthStage === CropGrowthStage.HARVESTED) return 1;
  if (!start || !end || end <= start) return 0;
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 26;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        <circle cx="32" cy="32" r={r} className="stroke-slate-100" strokeWidth="6" fill="none" />
        <motion.circle
          cx="32" cy="32" r={r}
          className="stroke-emerald-500"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: value }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-700">{label}</span>
    </div>
  );
}

const headline = ["Plan", "smarter."];
const headlineAccent = ["Harvest", "more."];

export default function LandingPage({ farms, crops, expenses, onNavigate }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  const totalAcres = farms.reduce((s, f) => s + f.areaAcres, 0);
  const activeCrops = crops.filter((c) => c.growthStage !== CropGrowthStage.HARVESTED);
  const projectedProfit = crops.reduce((s, c) => s + (c.expectedProfit || 0), 0);
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const featuredCrop = activeCrops[0];

  const overview = [
    { label: "Farm plots", to: farms.length, icon: <PlotsIcon className="w-[18px] h-[18px]" />, tab: "farms" },
    { label: "Acres under care", to: totalAcres, decimals: 1, icon: <SeedIcon className="w-[18px] h-[18px]" />, tab: "farms" },
    { label: "Active crops", to: activeCrops.length, icon: <CalendarIcon className="w-[18px] h-[18px]" />, tab: "crops" },
    { label: "Projected profit", to: projectedProfit, prefix: "₹", icon: <TrendingUp className="w-4 h-4" />, tab: "crops" },
    { label: "Season spend", to: totalSpend, prefix: "₹", icon: <LedgerIcon className="w-[18px] h-[18px]" />, tab: "financial" }
  ];

  return (
    <div className="text-slate-800 -mx-4 -my-6 md:-mx-8 md:-my-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-950 text-white py-16 md:py-20 px-4 md:px-10" style={{ ["--icon-accent" as string]: "#e0b13d" }}>
        <div className="absolute inset-0 field-rows" />
        <div className="blob absolute -top-24 -left-20 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="blob absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-harvest-500/10 blur-3xl" style={{ animationDelay: "-5s" }} />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-emerald-100"
            >
              <motion.span animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}>
                <SeedIcon className="w-4 h-4 text-emerald-200" />
              </motion.span>
              Your farm, in one place
            </motion.div>

            <h1 className="text-4xl md:text-6xl tracking-tight leading-[1.04]">
              {headline.map((w, i) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, y: 40, rotateX: -60 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
                  className="inline-block mr-3"
                >
                  {w}
                </motion.span>
              ))}
              <br />
              {headlineAccent.map((w, i) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, y: 40, rotateX: -60 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.45 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
                  className="inline-block mr-3 text-shimmer"
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-emerald-100/90 text-sm md:text-lg max-w-xl font-normal leading-relaxed"
            >
              Track plots and crops, check live weather, record expenses, get AI crop advice and trade with growers nearby, all in one workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2"
            >
              <MagneticButton
                onClick={() => onNavigate("farms")}
                className="group inline-flex items-center justify-center gap-2 bg-harvest-400 hover:bg-harvest-100 text-emerald-950 font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-black/20 text-sm cursor-pointer transition-colors"
              >
                Open my farm plots
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton
                onClick={() => onNavigate("docs")}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-4 rounded-xl text-sm cursor-pointer"
              >
                <Landmark className="w-4 h-4" />
                Read Platform Docs
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right live plot card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full max-w-md"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <TiltCard className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl relative shadow-2xl">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/35 rounded-full blur-2xl" />
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                      <CalendarIcon className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{featuredCrop ? featuredCrop.name : "Plot 1A: Basmati Paddy"}</h3>
                      <span className="text-[10px] text-emerald-300">Status: {featuredCrop ? featuredCrop.growthStage : "Sowing Stage"}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
                    </span>
                    LIVE
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {[
                    { k: "Crop health", v: "98%", n: 98 },
                    { k: "Soil hydration", v: "72% · Stable", n: 72 },
                    { k: "Season progress", v: `${Math.round((featuredCrop ? cropProgress(featuredCrop) : 0.4) * 100)}%`, n: (featuredCrop ? cropProgress(featuredCrop) : 0.4) * 100 }
                  ].map((row, i) => (
                    <div key={row.k} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">{row.k}</span>
                        <span className="font-bold text-emerald-300">{row.v}</span>
                      </div>
                      <AnimatedBar value={row.n} delay={0.6 + i * 0.15} className="bg-gradient-to-r from-emerald-300 to-harvest-400" />
                    </div>
                  ))}
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-emerald-200">Suggested action</span>
                    <span className="font-bold text-emerald-300">Nitrogen 20 kg/acre</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-emerald-300">
                  <span>Updated: Just now</span>
                  <span>Sensor grid synced</span>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mandi price ticker */}
      <section className="bg-slate-900 text-white overflow-hidden border-y border-slate-800">
        <div className="flex items-center">
          <span className="shrink-0 z-10 bg-emerald-500 text-slate-950 text-[10px] font-black tracking-widest uppercase px-4 py-3">Mandi prices ₹/qtl</span>
          <div className="overflow-hidden flex-1">
            <div className="marquee-track flex w-max">
              {[...marketTicker, ...marketTicker].map((m, i) => (
                <div key={i} className="flex items-center gap-2 px-6 py-3 text-xs border-r border-white/5 whitespace-nowrap">
                  <span className="font-bold">{m.crop}</span>
                  <span className="text-slate-400">{m.mandi}</span>
                  <span className="font-mono font-bold">₹{m.price.toLocaleString("en-IN")}</span>
                  <span className={`flex items-center gap-0.5 font-mono font-bold ${m.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {m.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {m.change > 0 ? "+" : ""}{m.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live farm overview */}
      <section className="py-14 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-600">Your workspace</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">Your farm at a glance</h2>
            </div>
            <p className="text-xs text-slate-500">Figures update live as you add plots, crops and expenses.</p>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {overview.map((o) => (
              <motion.button
                key={o.label}
                variants={riseItem}
                whileHover={{ y: -4, boxShadow: "0 16px 30px -14px rgba(6,78,59,0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(o.tab)}
                className="text-left bg-white border border-slate-100 rounded-2xl p-4 cursor-pointer group"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {o.icon}
                </span>
                <p className="text-xl font-extrabold text-slate-800">
                  <CountUp to={o.to} decimals={o.decimals} prefix={o.prefix} />
                </p>
                <p className="text-[11px] font-semibold text-slate-500">{o.label}</p>
              </motion.button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Harvest countdown */}
            <Reveal className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm">Harvest countdown</h3>
                <button onClick={() => onNavigate("crops")} className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer">Open crop calendar →</button>
              </div>
              {crops.length === 0 ? (
                <button
                  onClick={() => onNavigate("crops")}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl py-10 text-xs font-bold text-slate-400 hover:text-emerald-700 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  No crops yet. Log your first crop.
                </button>
              ) : (
                <motion.ul variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
                  {crops.map((c) => {
                    const days = Math.ceil((new Date(c.expectedHarvestDate).getTime() - Date.now()) / DAY_MS);
                    const pct = cropProgress(c);
                    const farm = farms.find((f) => f.id === c.farmId);
                    const stageIdx = stageOrder.indexOf(c.growthStage);
                    const done = c.growthStage === CropGrowthStage.HARVESTED;
                    return (
                      <motion.li key={c.id} variants={riseItem} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/50 transition-colors">
                        <ProgressRing value={pct} label={`${Math.round(pct * 100)}%`} />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-sm text-slate-800 truncate">{c.name}</p>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              done ? "bg-slate-200 text-slate-600" : days < 0 ? "bg-rose-100 text-rose-700" : days <= 21 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {done ? "Harvested" : days < 0 ? `${-days}d overdue` : `${days}d to go`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{c.variety} · {farm ? farm.name : "Unassigned plot"}</p>
                          <div className="flex gap-1">
                            {stageOrder.map((s, i) => (
                              <motion.span
                                key={s}
                                title={s}
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                className={`h-1.5 flex-1 rounded-full origin-left ${i <= stageIdx ? "bg-emerald-500" : "bg-slate-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </Reveal>

            {/* Quick actions */}
            <Reveal delay={0.1} className="bg-emerald-950 field-rows text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="blob absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl" />
              <h3 className="font-extrabold text-sm relative">Quick actions</h3>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-2 relative">
                {quickActions.map((qa) => (
                  <motion.button
                    key={qa.tab}
                    variants={riseItem}
                    whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.14)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate(qa.tab)}
                    className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    <span className="text-emerald-300">{qa.icon}</span>
                    <span className="flex-1 text-left">{qa.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                  </motion.button>
                ))}
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-emerald-50 border-y border-emerald-100 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((st, idx) => (
            <Reveal key={idx} delay={idx * 0.08} className="space-y-1">
              <p className="text-2xl md:text-3xl font-extrabold text-slate-800 font-sans">
                <CountUp to={st.to} decimals={st.decimals} prefix={st.prefix} suffix={st.suffix} />
              </p>
              <p className="text-xs md:text-sm text-slate-600 font-medium">{st.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feature section */}
      <section className="py-20 px-4 md:px-8">
        <Reveal className="max-w-6xl mx-auto text-center mb-14 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
            A Multi-Dimensional Platform Built For Modern Farming
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
            Equip your enterprise with data points, predictive calendars, local market trends, and secure client-side database registers.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((ft) => (
            <motion.div key={ft.title} variants={riseItem}>
              <TiltCard className="h-full">
                <button
                  onClick={() => onNavigate(ft.tab)}
                  className="h-full w-full text-left bg-white border border-slate-100 hover:border-emerald-200 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 group cursor-pointer transition-all"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                  >
                    {ft.icon}
                  </motion.div>
                  <h3 className="font-extrabold text-slate-800 text-lg mb-2 font-sans">{ft.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{ft.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Open module <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Farmer Success Stories carousel */}
      <section className="bg-emerald-950/5 py-20 px-4 md:px-8 border-y border-emerald-100">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <Reveal className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Farmer Success Stories</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-xs md:text-sm">
              Real outcomes from growers who upgraded their workflow with AgriSphere.
            </p>
          </Reveal>

          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 60, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -60, rotate: -2 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg shadow-emerald-900/5 space-y-5 text-left"
              >
                <Quote className="w-8 h-8 text-emerald-200" />
                <p className="text-slate-700 text-sm md:text-base italic leading-relaxed">"{testimonials[testimonialIdx].quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-semibold">
                    {testimonials[testimonialIdx].initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{testimonials[testimonialIdx].name}</h4>
                    <span className="text-xs text-slate-500">{testimonials[testimonialIdx].role}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)} className="p-1 cursor-pointer" aria-label={`Story ${i + 1}`}>
                <motion.span
                  animate={{ width: i === testimonialIdx ? 28 : 8, backgroundColor: i === testimonialIdx ? "#059669" : "#cbd5e1" }}
                  className="block h-2 rounded-full"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <Reveal className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2 font-sans">
              <HelpCircle className="w-8 h-8 text-emerald-600" />
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-xs md:text-sm">
              Answers to common queries about AgriSphere capabilities.
            </p>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const open = openFaq === idx;
              return (
                <Reveal key={idx} delay={idx * 0.06}>
                  <motion.div layout className={`rounded-xl border transition-colors ${open ? "bg-white border-emerald-200 shadow-md shadow-emerald-900/5" : "bg-slate-50 border-slate-200"}`}>
                    <button
                      onClick={() => setOpenFaq(open ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                    >
                      <span className="text-sm md:text-base font-bold text-slate-800">{faq.q}</span>
                      <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-emerald-600">
                        <ChevronDown className="w-5 h-5" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-xs md:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 md:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <LogoMark className="w-7 h-7 text-emerald-200" />
            </motion.span>
            <span className="text-white font-extrabold font-sans text-lg tracking-tight">AgriSphere</span>
          </div>
          <div className="text-xs text-slate-500">
            © 2026 AgriSphere AI Platform. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
