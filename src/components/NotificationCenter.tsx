/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, CloudRain, Wheat, Bug, Wallet, CheckCheck } from "lucide-react";
import { BellIcon } from "./icons";
import { Crop, CropGrowthStage, Expense, Notification } from "../types";
import { fetchWeather, presetPlaces, LiveWeather, WeatherPlace } from "../weather";

interface NotificationCenterProps {
  crops: Crop[];
  expenses: Expense[];
  readIds: string[];
  onMarkRead: (ids: string[]) => void;
  onNavigate: (tab: string) => void;
}

const typeMeta: Record<Notification["type"], { icon: React.ReactNode; tab: string; tint: string }> = {
  weather: { icon: <CloudRain className="w-4 h-4" />, tab: "weather", tint: "bg-sky-50 text-sky-600" },
  pest: { icon: <Bug className="w-4 h-4" />, tab: "disease", tint: "bg-rose-50 text-rose-600" },
  harvest: { icon: <Wheat className="w-4 h-4" />, tab: "crops", tint: "bg-amber-50 text-amber-600" },
  fertilizer: { icon: <Wheat className="w-4 h-4" />, tab: "ai", tint: "bg-emerald-50 text-emerald-600" },
  payment: { icon: <Wallet className="w-4 h-4" />, tab: "financial", tint: "bg-violet-50 text-violet-600" },
  marketplace: { icon: <Wallet className="w-4 h-4" />, tab: "marketplace", tint: "bg-emerald-50 text-emerald-600" },
  system: { icon: <Bell className="w-4 h-4" />, tab: "landing", tint: "bg-slate-100 text-slate-600" }
};

const DAY_MS = 86_400_000;

// Builds alerts from the live farm data so the bell reflects what the farmer has entered
function buildNotifications(crops: Crop[], expenses: Expense[], weather: LiveWeather | null): Notification[] {
  const now = Date.now();
  const list: Notification[] = [];

  crops.forEach((c) => {
    if (c.growthStage === CropGrowthStage.HARVESTED) return;
    const days = Math.ceil((new Date(c.expectedHarvestDate).getTime() - now) / DAY_MS);
    if (days < 0) {
      list.push({ id: `harvest-late-${c.id}`, userId: "user-1", type: "harvest", title: `${c.name} is past its harvest date`, message: `Expected ${c.expectedHarvestDate}. Update its stage or plan the harvest.`, createdAt: "Today", isRead: false });
    } else if (days <= 21) {
      list.push({ id: `harvest-soon-${c.id}`, userId: "user-1", type: "harvest", title: `${c.name} harvest in ${days} day${days === 1 ? "" : "s"}`, message: "Book a harvester early from the Co-op Marketplace.", createdAt: "Today", isRead: false });
    }
    if (c.growthStage === CropGrowthStage.FLOWERING) {
      list.push({ id: `pest-${c.id}`, userId: "user-1", type: "pest", title: `Scout ${c.name} for pests`, message: "Flowering crops are most vulnerable. Run a leaf scan this week.", createdAt: "Today", isRead: false });
    }
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  if (total > 0) {
    list.push({ id: `spend-${expenses.length}-${total}`, userId: "user-1", type: "payment", title: `Season spend: ₹${total.toLocaleString("en-IN")}`, message: `${expenses.length} ledger entries recorded so far.`, createdAt: "Today", isRead: false });
  }

  if (weather) {
    const wet = weather.daily.slice(0, 3).find((d) => d.rainProb >= 60);
    const hot = weather.daily.find((d) => d.max >= 38);
    if (wet) {
      list.push({ id: `weather-rain-${wet.date}`, userId: "user-1", type: "weather", title: `Rain likely ${wet.day === "Today" ? "today" : `on ${wet.day}`} (${wet.rainProb}%)`, message: "Hold off on spraying and skip the next irrigation cycle.", createdAt: "Live", isRead: false });
    } else if (hot) {
      list.push({ id: `weather-heat-${hot.date}`, userId: "user-1", type: "weather", title: `Heat up to ${hot.max}°C on ${hot.day}`, message: "Irrigate early morning or evening and mulch exposed beds.", createdAt: "Live", isRead: false });
    }
  }

  return list;
}

// Live forecast for the location chosen on the Weather page
function useAlertWeather() {
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  useEffect(() => {
    let place: WeatherPlace = presetPlaces[0];
    try {
      const stored = localStorage.getItem("agrisphere:weatherPlace");
      if (stored) place = JSON.parse(stored);
    } catch {
      // fall back to the default hub
    }
    const ctrl = new AbortController();
    fetchWeather(place, ctrl.signal).then(setWeather).catch(() => {});
    return () => ctrl.abort();
  }, []);
  return weather;
}

export default function NotificationCenter({ crops, expenses, readIds, onMarkRead, onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const weather = useAlertWeather();

  const notifications = useMemo(
    () => buildNotifications(crops, expenses, weather).map((n) => ({ ...n, isRead: readIds.includes(n.id) })),
    [crops, expenses, weather, readIds]
  );
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
        aria-label="Notifications"
      >
        <motion.span
          className="block"
          animate={unread > 0 ? { rotate: [0, -14, 12, -8, 6, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
        >
          <BellIcon className="w-5 h-5" />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-800">Field alerts</span>
              <button
                onClick={() => onMarkRead(notifications.map((n) => n.id))}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              className="max-h-96 overflow-y-auto divide-y divide-slate-50"
            >
              {notifications.map((n) => {
                const meta = typeMeta[n.type];
                return (
                  <motion.li
                    key={n.id}
                    variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0 } }}
                    whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                    onClick={() => {
                      onMarkRead([n.id]);
                      onNavigate(meta.tab);
                      setOpen(false);
                    }}
                    className="flex gap-3 px-4 py-3 cursor-pointer"
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.tint}`}>{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${n.isRead ? "font-semibold text-slate-500" : "font-extrabold text-slate-800"}`}>{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />}
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
