/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { User } from "../types";
import { api } from "../api";
import { useToast } from "./Toaster";

interface AccountModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

const inputClass =
  "w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all";

export default function AccountModal({ open, user, onClose, onUserUpdated }: AccountModalProps) {
  const toast = useToast();
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [name, setName] = useState(user.name);
  const [location, setLocation] = useState(user.location || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(user.name);
      setLocation(user.location || "");
      setCurrentPassword("");
      setNewPassword("");
      setError("");
    }
  }, [open, user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ user: User }>("/auth/profile", { method: "PATCH", body: { name, location } });
      onUserUpdated(res.user);
      toast("Profile updated", "success");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      await api("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } });
      toast("Password changed", "success");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Account settings"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <div>
                <h3 className="font-extrabold text-slate-900">Account settings</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 cursor-pointer" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1 px-5 mt-4 border-b border-slate-100">
              {(["profile", "password"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError("");
                  }}
                  className={`relative px-3 py-2.5 text-xs font-bold cursor-pointer ${tab === t ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {t === "profile" ? "Profile" : "Password"}
                  {tab === t && <motion.span layoutId="account-tab" className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              ))}
            </div>

            <div className="p-5">
              {error && <p role="alert" className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
              <AnimatePresence mode="wait">
                {tab === "profile" ? (
                  <motion.form key="profile" onSubmit={saveProfile} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                    <div>
                      <label htmlFor="acc-name" className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                      <input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="acc-loc" className="text-xs font-bold text-slate-600 mb-1.5 block">Village / district</label>
                      <input id="acc-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Indore, MP" className={inputClass} />
                    </div>
                    <div className="text-xs text-slate-500">Account type: <span className="font-bold text-slate-700">{user.role}</span> · Member since {user.memberSince}</div>
                    <SubmitButton busy={busy}>Save changes</SubmitButton>
                  </motion.form>
                ) : (
                  <motion.form key="password" onSubmit={changePassword} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <div>
                      <label htmlFor="acc-cur" className="text-xs font-bold text-slate-600 mb-1.5 block">Current password</label>
                      <input id="acc-cur" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="acc-new" className="text-xs font-bold text-slate-600 mb-1.5 block">New password</label>
                      <input id="acc-new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className={inputClass} />
                    </div>
                    <SubmitButton busy={busy}>Change password</SubmitButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      disabled={busy}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-70 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
