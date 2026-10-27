/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type ToastKind = "success" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  info: <Info className="w-4 h-4 text-sky-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />
};

const TOAST_MS = 4200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message, kind }]);
    setTimeout(() => dismiss(id), TOAST_MS);
  }, []);

  // Modules still call window.alert(); route those into animated toasts instead of a blocking dialog
  useEffect(() => {
    const original = window.alert;
    window.alert = (msg?: unknown) => {
      const text = String(msg ?? "");
      const kind: ToastKind = /required|invalid|please|error|fail/i.test(text) ? "warning" : "success";
      push(text, kind);
    };
    return () => { window.alert = original; };
  }, [push]);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:right-5 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur border border-slate-200 shadow-xl shadow-slate-900/10 rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
              <p className="text-xs font-semibold text-slate-700 leading-relaxed flex-1">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: TOAST_MS / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-emerald-500/60"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
