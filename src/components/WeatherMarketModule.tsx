/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudLightning, Snowflake, Wind, Droplets, Thermometer, MapPin, Search, LocateFixed, RefreshCw, ChevronDown, AlertTriangle, Umbrella, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { AnimatedBar, CountUp, riseItem, staggerContainer } from "./MotionKit";
import { usePersistentState } from "../usePersistentState";
import { fetchWeather, searchPlaces, farmingTips, describeWeather, weatherKind, presetPlaces, LiveWeather, WeatherPlace, WeatherKind } from "../weather";
import { WeatherIcon as WeatherMark, MarketIcon, SeedIcon } from "./icons";

// Tab pane cross-fade; children inherit the stagger
const paneVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.05 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16 } }
};

// Opacity-only reveal for `.rounded-2xl.border` cards so the CSS hover lift keeps working
const fadeItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.1 } }
};

const dayItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

const kindIcon: Record<WeatherKind, { Icon: typeof Sun; color: string }> = {
  sun: { Icon: Sun, color: "text-harvest-500" },
  partly: { Icon: CloudSun, color: "text-harvest-500" },
  cloud: { Icon: Cloud, color: "text-slate-400" },
  fog: { Icon: CloudFog, color: "text-slate-400" },
  drizzle: { Icon: CloudDrizzle, color: "text-sky-500" },
  rain: { Icon: CloudRain, color: "text-sky-600" },
  storm: { Icon: CloudLightning, color: "text-slate-600" },
  snow: { Icon: Snowflake, color: "text-sky-400" }
};

// Static condition icon for a forecast day
function ForecastGlyph({ code, className = "w-5 h-5" }: { code: number; className?: string }) {
  const { Icon, color } = kindIcon[weatherKind(code)];
  return <Icon className={`${className} ${color}`} strokeWidth={1.75} />;
}

function LocationPicker({ place, onChange }: { place: WeatherPlace; onChange: (p: WeatherPlace) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WeatherPlace[]>([]);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Debounced place search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      searchPlaces(query.trim(), ctrl.signal).then(setResults).catch(() => {});
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const choose = (p: WeatherPlace) => {
    onChange(p);
    setOpen(false);
    setQuery("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choose({ name: "My location", region: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`, lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setGeoError("Location permission was denied.");
      },
      { timeout: 10000 }
    );
  };

  const list = results.length > 0 ? results : presetPlaces;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-3.5 pr-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm cursor-pointer transition-colors"
      >
        <MapPin className="w-4 h-4 text-emerald-700" />
        <span className="max-w-[min(200px,55vw)] truncate">{place.name}{place.region ? `, ${place.region}` : ""}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            style={{ transformOrigin: "top right" }}
            className="absolute left-0 md:left-auto md:right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-xl shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 z-40 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-2 bg-white border border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-xl px-3 py-2 transition">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a town or district"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg py-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                <LocateFixed className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                {locating ? "Finding your location…" : "Use my current location"}
              </button>
              {geoError && <p className="text-xs text-rose-600 text-center">{geoError}</p>}
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              <span className="block px-2.5 pt-1 pb-1.5 text-xs font-medium text-slate-500">
                {results.length > 0 ? "Search results" : "Major farming hubs"}
              </span>
              {list.map((p) => (
                <button
                  key={`${p.name}-${p.lat}`}
                  onClick={() => choose(p)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors hover:bg-slate-50 ${p.name === place.name && p.lat === place.lat ? "bg-emerald-50 hover:bg-emerald-50" : ""}`}
                >
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="text-slate-500"> · {p.region}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 rounded-2xl bg-emerald-900 min-h-[300px] sheen" />
      <div className="lg:col-span-3 space-y-6">
        <div className="h-44 rounded-2xl bg-slate-100 sheen" />
        <div className="h-36 rounded-2xl bg-slate-100 sheen" />
      </div>
    </div>
  );
}

export default function WeatherMarketModule() {
  const [activeSubTab, setActiveSubTab] = useState<"weather" | "market">("weather");
  const [place, setPlace] = usePersistentState<WeatherPlace>("weatherPlace", presetPlaces[0]);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    fetchWeather(place, ctrl.signal)
      .then((w) => setWeather(w))
      .catch((e) => {
        if (e.name !== "AbortError") setError("Couldn't reach the weather service. Check your internet connection and try again.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [place.lat, place.lon, reloadKey]);

  const placeKey = `${place.lat},${place.lon}`;
  const isRainy = weather ? ["rain", "drizzle", "storm"].includes(weatherKind(weather.code)) : false;
  const tips = weather ? farmingTips(weather) : [];

  // Weekly high/low span, used to place each day's temperature range bar
  const weekMin = weather ? Math.min(...weather.daily.map((d) => d.min)) : 0;
  const weekMax = weather ? Math.max(...weather.daily.map((d) => d.max)) : 1;
  const weekSpan = weekMax - weekMin || 1;

  // Indicative mandi prices (sample data, not a live feed)
  const commodities = [
    { name: "Basmati Rice (Paddy)", todayPrice: "₹4,200", unit: "per quintal", change: "+₹150", trend: "up", history: [3900, 4000, 4100, 4050, 4120, 4200] },
    { name: "Sona Masuri Paddy", todayPrice: "₹2,650", unit: "per quintal", change: "-₹40", trend: "down", history: [2800, 2750, 2720, 2700, 2690, 2650] },
    { name: "Wheat (Desi)", todayPrice: "₹2,450", unit: "per quintal", change: "+₹80", trend: "up", history: [2200, 2300, 2280, 2350, 2400, 2450] },
    { name: "Chana (Chickpea)", todayPrice: "₹5,350", unit: "per quintal", change: "+₹210", trend: "up", history: [5000, 5100, 5080, 5150, 5240, 5350] }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <WeatherMark className="w-6 h-6" animate />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Conditions & rates</span>
            <h2 className="text-3xl text-slate-900 mt-0.5">Weather & Market Prices</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Live local forecast with field advice, plus indicative mandi rates.
            </p>
          </div>
        </div>
        <div className="self-start md:self-auto shrink-0">
          <LocationPicker place={place} onChange={setPlace} />
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1" role="tablist">
        {([
          { id: "weather", label: "7-day forecast", icon: <WeatherMark className="w-4 h-4" mono /> },
          { id: "market", label: "Mandi prices", icon: <MarketIcon className="w-4 h-4" mono /> }
        ] as const).map((t) => {
          const active = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSubTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="weather-market-tab-pill"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm ring-1 ring-slate-200/70"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative inline-flex ${active ? "text-emerald-700" : ""}`}>{t.icon}</span>
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panes */}
      <div>
        <AnimatePresence mode="wait">
          {/* Tab: Weather */}
          {activeSubTab === "weather" && (
            <motion.div key="weather" variants={paneVariants} initial="hidden" animate="show" exit="exit">
              {error ? (
                <motion.div variants={fadeItem} className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Forecast unavailable</p>
                  <p className="text-sm text-slate-500 mt-1">{error}</p>
                  <button
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="mt-5 inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Try again
                  </button>
                </motion.div>
              ) : loading && !weather ? (
                <WeatherSkeleton />
              ) : weather ? (
                <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
                  {/* Current conditions */}
                  <motion.div variants={riseItem} className="lg:col-span-2 bg-emerald-900 field-rows text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between gap-6 min-h-[300px]">
                    {/* Ambient condition icon */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isRainy ? "rain" : "sun"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.08 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute -right-8 top-10 pointer-events-none"
                        aria-hidden
                      >
                        {isRainy ? <CloudRain className="w-44 h-44" strokeWidth={1.25} /> : <Sun className="w-44 h-44" strokeWidth={1.25} />}
                      </motion.div>
                    </AnimatePresence>

                    <div className="relative flex justify-between items-start gap-3">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={placeKey}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="min-w-0"
                        >
                          <span className="text-xs text-emerald-200/80">Now in</span>
                          <h4 className="font-display text-2xl font-medium truncate leading-tight">{place.name}</h4>
                          <p className="text-sm text-emerald-100 mt-1">{describeWeather(weather.code)}</p>
                          <p className="text-xs text-emerald-200/80 mt-1 flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5" /> Feels like <span className="tabular-nums">{weather.feelsLike}°C</span>
                          </p>
                        </motion.div>
                      </AnimatePresence>
                      <span key={placeKey} className="text-6xl font-semibold tracking-tight tabular-nums leading-none">
                        <CountUp to={weather.temp} suffix="°" duration={1.2} />
                      </span>
                    </div>

                    {/* Metrics */}
                    <motion.div key={placeKey} variants={staggerContainer} initial="hidden" animate="show" className="relative grid grid-cols-3 gap-4 pt-5 border-t border-white/10">
                      <motion.div variants={riseItem} className="flex flex-col">
                        <span className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5" /> Humidity
                        </span>
                        <span className="text-lg font-semibold mt-0.5 tabular-nums">{weather.humidity}%</span>
                        <div className="mt-1.5">
                          <AnimatedBar value={weather.humidity} className="bg-sky-300" delay={0.2} />
                        </div>
                      </motion.div>
                      <motion.div variants={riseItem} className="flex flex-col">
                        <span className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                          <Umbrella className="w-3.5 h-3.5" /> Rain today
                        </span>
                        <span className="text-lg font-semibold mt-0.5 tabular-nums">{weather.rainProbToday}%</span>
                        <div className="mt-1.5">
                          <AnimatedBar value={weather.rainProbToday} className="bg-harvest-400" delay={0.3} />
                        </div>
                      </motion.div>
                      <motion.div variants={riseItem} className="flex flex-col">
                        <span className="text-xs text-emerald-200/80 flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5" /> Wind
                        </span>
                        <span className="text-lg font-semibold mt-0.5 tabular-nums">{weather.wind} <span className="text-sm font-medium text-emerald-100">km/h</span></span>
                      </motion.div>
                    </motion.div>

                    <div className="relative flex items-center justify-between text-xs text-emerald-200/80">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                        Live · updated <span className="tabular-nums">{weather.fetchedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                      <button onClick={() => setReloadKey((k) => k + 1)} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" aria-label="Refresh weather">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                      </button>
                    </div>
                  </motion.div>

                  {/* Right: advice + forecast */}
                  <div className="lg:col-span-3 space-y-6">
                    <motion.div variants={fadeItem} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <SeedIcon className="w-5 h-5 text-emerald-700 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Field advice for this week</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Based on the forecast for {place.name}.</p>
                        </div>
                      </div>
                      <motion.ol key={placeKey} variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
                        {tips.map((tip, idx) => (
                          <motion.li key={idx} variants={riseItem} className="flex gap-3 items-start">
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0 tabular-nums">{idx + 1}</span>
                            <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{tip}</p>
                          </motion.li>
                        ))}
                      </motion.ol>
                    </motion.div>

                    {/* 7-day forecast */}
                    <motion.div variants={fadeItem} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                      <div className="flex items-baseline justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Next 7 days</h3>
                        <span className="text-xs text-slate-400">Source: Open-Meteo</span>
                      </div>
                      <motion.div key={placeKey} variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                        {weather.daily.map((fc, idx) => {
                          const left = ((fc.min - weekMin) / weekSpan) * 100;
                          const width = Math.max(8, ((fc.max - fc.min) / weekSpan) * 100);
                          return (
                            <motion.div
                              key={fc.date}
                              variants={dayItem}
                              title={`${describeWeather(fc.code)} · ${fc.rainMm.toFixed(1)} mm`}
                              className={`p-2.5 rounded-xl flex flex-col items-center transition-colors hover:bg-slate-50 ${idx === 0 ? "bg-slate-50" : ""}`}
                            >
                              <span className={`text-xs ${idx === 0 ? "font-semibold text-slate-900" : "font-medium text-slate-500"}`}>{fc.day}</span>
                              <div className="my-2.5"><ForecastGlyph code={fc.code} /></div>
                              <span className="text-sm font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                                {fc.max}° <span className="text-slate-400 font-medium">{fc.min}°</span>
                              </span>
                              <div className="relative w-full h-1 mt-2 rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                  style={{ left: `${left}%`, width: `${width}%`, originX: 0 }}
                                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-harvest-400"
                                />
                              </div>
                              <span className={`mt-2 text-xs font-medium flex items-center gap-0.5 tabular-nums ${fc.rainProb >= 60 ? "text-sky-700" : "text-slate-400"}`}>
                                <Droplets className="w-3 h-3" />{fc.rainProb}%
                              </span>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Tab: Market Rates */}
          {activeSubTab === "market" && (
            <motion.div key="market" variants={paneVariants} initial="hidden" animate="show" exit="exit" className="space-y-5">
              <motion.div variants={riseItem} className="flex items-start gap-2.5 text-sm text-slate-600 bg-harvest-50 border border-harvest-100 rounded-xl px-4 py-3 max-w-3xl">
                <Info className="w-4 h-4 text-harvest-600 shrink-0 mt-0.5" />
                <p>Indicative prices for planning. Confirm today's rate with your local APMC mandi before selling.</p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {commodities.map((item, idx) => {
                  const min = Math.min(...item.history);
                  const max = Math.max(...item.history);
                  const range = max - min || 1;
                  const points = item.history.map((val, i) => ({
                    x: (i / (item.history.length - 1)) * 300,
                    y: 50 - ((val - min) / range) * 40
                  }));
                  const linePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
                  const up = item.trend === "up";
                  const stroke = up ? "var(--color-emerald-600)" : "var(--color-rose-600)";
                  const priceValue = parseFloat(item.todayPrice.replace(/[^\d.]/g, ""));
                  const last = points[points.length - 1];

                  return (
                    // Wrapper carries the motion transform so the card's CSS hover lift stays intact
                    <motion.div key={idx} variants={riseItem} className="h-full">
                      <div className="h-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-base truncate">{item.name}</h4>
                            <span className="text-xs text-slate-500">{item.unit}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-2xl font-semibold text-slate-900 block tabular-nums leading-tight">
                              {isNaN(priceValue) ? item.todayPrice : <CountUp to={priceValue} prefix="₹" duration={1.2} />}
                            </span>
                            <span
                              className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                                up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {item.change}
                            </span>
                          </div>
                        </div>

                        <div>
                          <svg className="w-full h-16 overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none" aria-label={`${item.name} price trend over 6 weeks`}>
                            <defs>
                              <linearGradient id={`mandi-area-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={stroke} stopOpacity="0.14" />
                                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <line x1="0" y1="15" x2="300" y2="15" stroke="var(--color-slate-200)" strokeWidth="0.75" strokeDasharray="3,4" vectorEffect="non-scaling-stroke" />
                            <line x1="0" y1="45" x2="300" y2="45" stroke="var(--color-slate-200)" strokeWidth="0.75" strokeDasharray="3,4" vectorEffect="non-scaling-stroke" />
                            <motion.path
                              d={`${linePath} L 300 60 L 0 60 Z`}
                              fill={`url(#mandi-area-${idx})`}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: 0.7 }}
                            />
                            <motion.path
                              d={linePath}
                              fill="none"
                              stroke={stroke}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                              initial={{ pathLength: 0 }}
                              whileInView={{ pathLength: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.1, delay: 0.2 + idx * 0.06, ease: [0.65, 0, 0.35, 1] }}
                            />
                            <motion.circle
                              cx={last.x}
                              cy={last.y}
                              r="3.5"
                              fill={stroke}
                              stroke="white"
                              strokeWidth="1.5"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 1.2 + idx * 0.06 }}
                            />
                          </svg>
                          <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                            <span>6 weeks ago</span>
                            <span>3 weeks ago</span>
                            <span>Today</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
