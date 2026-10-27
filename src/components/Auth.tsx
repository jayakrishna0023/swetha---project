/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Role, User } from "../types";
import { api } from "../api";
import { KeyRound, Mail, UserRound, MapPin, ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { LogoMark, CalendarIcon, WeatherIcon, LedgerIcon, MarketIcon, ArrowIcon } from "./icons";
import { motion, AnimatePresence } from "motion/react";

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const highlights = [
  { icon: <CalendarIcon className="w-[18px] h-[18px]" />, text: "Track every plot and crop from sowing to harvest" },
  { icon: <WeatherIcon className="w-[18px] h-[18px]" />, text: "Live local weather with field-ready advice" },
  { icon: <LedgerIcon className="w-[18px] h-[18px]" />, text: "Record expenses and forecast your profit" },
  { icon: <MarketIcon className="w-[18px] h-[18px]" />, text: "Sell produce and rent equipment from nearby growers" }
];

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Too short", color: "bg-rose-500" },
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-lime-500" },
    { label: "Strong", color: "bg-emerald-500" },
    { label: "Very strong", color: "bg-emerald-600" }
  ];
  return { score: pw.length < 8 ? 0 : score, ...levels[pw.length < 8 ? 0 : score] };
}

const inputClass =
  "w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all";

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
      {children}
    </div>
  );
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<Role>(Role.FARMER);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";
  const strength = passwordStrength(password);

  const fail = (msg: string) => {
    setError(msg);
    setErrorKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLogin && name.trim().length < 2) return fail("Please enter your full name.");
    if (!email.trim()) return fail("Please enter your email address.");
    if (!password) return fail("Please enter your password.");
    if (!isLogin && password.length < 8) return fail("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const { user } = await api<{ user: User }>(isLogin ? "/auth/login" : "/auth/signup", {
        method: "POST",
        body: isLogin ? { email, password } : { name, email, password, role, location }
      });
      onAuthSuccess(user);
    } catch (err: any) {
      fail(err.message);
      setSubmitting(false);
    }
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError("");
  };

  return (
    <div className="min-h-dvh flex bg-white font-sans">
      {/* Brand panel */}
      <div className="hidden lg:flex relative w-[46%] overflow-hidden bg-emerald-950 text-white p-12 flex-col justify-between" style={{ ["--icon-accent" as string]: "#e0b13d" }}>
        <div className="absolute inset-0 field-rows" />
        <div className="blob absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="blob absolute -bottom-32 -right-10 w-[28rem] h-[28rem] rounded-full bg-lime-400/15 blur-3xl" style={{ animationDelay: "-6s" }} />

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <LogoMark className="w-7 h-7" animate />
          </div>
          <div>
            <span className="font-display font-semibold text-xl tracking-tight block leading-none">AgriSphere</span>
            <span className="text-[10px] text-emerald-200/50 font-medium tracking-[0.14em] uppercase block mt-1">Farm management</span>
          </div>
        </motion.div>

        <div className="relative space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 160, damping: 20 }}
            className="text-4xl xl:text-[3.4rem] leading-[1.05] tracking-tight"
          >
            Run your farm<br />
            <span className="text-shimmer">with clarity.</span>
          </motion.h1>
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}
            className="space-y-3.5"
          >
            {highlights.map((h) => (
              <motion.li
                key={h.text}
                variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                className="flex items-center gap-3 text-sm text-emerald-100/90"
              >
                <span className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-100 shrink-0">{h.icon}</span>
                {h.text}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="relative text-xs text-emerald-300/70">
          Your farm records are private to your account. Marketplace listings and discussions are shared with the community.
        </motion.p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-white flex items-center justify-center">
              <LogoMark className="w-6 h-6" />
            </div>
            <span className="font-display font-semibold text-lg text-slate-900 tracking-tight">AgriSphere</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="text-3xl text-slate-900 tracking-tight">{isLogin ? "Welcome back" : "Create your account"}</h2>
              <p className="text-sm text-slate-500 mt-1">{isLogin ? "Sign in to manage your farm." : "It takes less than a minute. Free for growers and buyers."}</p>
            </motion.div>
          </AnimatePresence>

          {/* Mode switch */}
          <div className="mt-6 grid grid-cols-2 bg-slate-100 rounded-xl p-1 text-sm font-bold">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => switchMode(m)} className={`relative py-2 rounded-lg cursor-pointer transition-colors ${mode === m ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
                {mode === m && <motion.span layoutId="auth-mode-pill" className="absolute inset-0 bg-white rounded-lg shadow-sm" transition={{ type: "spring", stiffness: 450, damping: 34 }} />}
                <span className="relative">{m === "login" ? "Sign in" : "Sign up"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key={errorKey}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20, x: [0, -8, 8, -5, 5, 0] }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div role="alert" className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-sm text-rose-700">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pb-px">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">I am a</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[Role.FARMER, Role.BUYER].map((r) => (
                          <motion.button
                            key={r}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setRole(r)}
                            className={`py-2.5 rounded-xl text-sm font-bold border cursor-pointer transition-colors ${
                              role === r ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {r === Role.FARMER ? "Farmer" : "Buyer"}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="auth-name" className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                      <Field icon={<UserRound className="w-4 h-4" />}>
                        <input id="auth-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} />
                      </Field>
                    </div>
                    <div>
                      <label htmlFor="auth-location" className="text-xs font-bold text-slate-600 mb-1.5 block">
                        Village / district <span className="font-medium text-slate-400">(optional)</span>
                      </label>
                      <Field icon={<MapPin className="w-4 h-4" />}>
                        <input id="auth-location" autoComplete="address-level2" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Indore, MP" className={inputClass} />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="auth-email" className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
              <Field icon={<Mail className="w-4 h-4" />}>
                <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </Field>
            </div>

            <div>
              <label htmlFor="auth-password" className="text-xs font-bold text-slate-600 mb-1.5 block">Password</label>
              <Field icon={<KeyRound className="w-4 h-4" />}>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Your password" : "At least 8 characters"}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              <AnimatePresence>
                {!isLogin && password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            className={`h-full ${strength.color}`}
                            initial={false}
                            animate={{ width: strength.score >= i ? "100%" : "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{strength.label}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? {} : { y: -1 }}
              whileTap={submitting ? {} : { scale: 0.98 }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-emerald-800/70 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {isLogin ? "Sign in" : "Create account"}
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-6">
            {isLogin ? "New to AgriSphere? " : "Already have an account? "}
            <button type="button" onClick={() => switchMode(isLogin ? "signup" : "login")} className="font-bold text-emerald-700 hover:underline cursor-pointer">
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
