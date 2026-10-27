/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, CornerDownLeft } from "lucide-react";

export interface PaletteItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface CommandPaletteProps {
  open: boolean;
  items: PaletteItem[];
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function CommandPalette({ open, items, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase().trim())),
    [items, query]
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const choose = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      choose(results[cursor].id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onKeyDown={handleKey}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a module…"
                className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
              />
              <kbd className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="text-xs text-slate-400 text-center py-8">No modules match "{query}"</li>
              )}
              {results.map((item, idx) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onMouseEnter={() => setCursor(idx)}
                  onClick={() => choose(item.id)}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  {idx === cursor && (
                    <motion.div
                      layoutId="palette-cursor"
                      className="absolute inset-0 bg-emerald-50 rounded-xl"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className={`relative ${idx === cursor ? "text-emerald-700" : ""}`}>{item.icon}</span>
                  <span className={`relative flex-1 ${idx === cursor ? "text-emerald-900" : ""}`}>{item.label}</span>
                  {idx === cursor && <CornerDownLeft className="relative w-3.5 h-3.5 text-emerald-600" />}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
