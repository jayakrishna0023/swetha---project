/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MarketplaceItem, Equipment } from "../types";
import { MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { riseItem } from "./MotionKit";
import { MarketIcon, TractorIcon, SeedIcon, PlusIcon } from "./icons";

interface MarketplaceModuleProps {
  items: MarketplaceItem[];
  equipmentList: Equipment[];
  onAddItem: (item: MarketplaceItem) => void;
  onAddEquipment: (eq: Equipment) => void;
  onBookEquipment: (id: string) => void;
}

// Listing grid cross-fade; cards inherit the stagger
const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.05, delayChildren: 0.04 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

// Form fields cascade in once the panel has opened
const formVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } }
};

const fieldItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
};

// Expand/collapse for banners and the listing form (marginBottom mirrors the root's space-y-8).
// Clips only while animating so the settled card's hover lift and shadow aren't cut off.
function Collapse({ children }: { children: React.ReactNode; key?: React.Key }) {
  const [settled, setSettled] = useState(false);
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
      animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onAnimationStart={() => setSettled(false)}
      onAnimationComplete={() => setSettled(true)}
      style={{ overflow: settled ? "visible" : "hidden" }}
    >
      {children}
    </motion.div>
  );
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "block text-xs font-medium text-slate-600 mb-1.5";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer";

const formatRupees = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

export default function MarketplaceModule({ items, equipmentList, onAddItem, onAddEquipment, onBookEquipment }: MarketplaceModuleProps) {
  const [activeTab, setActiveTab] = useState<"produce" | "rental">("produce");
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Produce Form State
  const [pTitle, setPTitle] = useState("");
  const [pCrop, setPCrop] = useState("Basmati Rice");
  const [pQty, setPQty] = useState(500);
  const [pPrice, setPPrice] = useState(45);
  const [pLoc, setPLoc] = useState("Indore, MP");
  const [pPhone, setPPhone] = useState("+91 98765 43210");
  const [pDesc, setPDesc] = useState("");

  // Rental Form State
  const [rName, setRName] = useState("");
  const [rRate, setRRate] = useState(1500);
  const [rLoc, setRLoc] = useState("Indore, MP");
  const [rPhone, setRPhone] = useState("+91 98765 43210");
  const [rDesc, setRDesc] = useState("");

  const handleAddProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pDesc) return;

    const newItem: MarketplaceItem = {
      id: "prod-" + Math.random().toString(36).substr(2, 9),
      farmerId: "curr-farmer",
      farmerName: "Ramesh Sen (Verified)",
      title: pTitle,
      cropName: pCrop,
      variety: "Organic Premium A-Grade",
      quantityKg: pQty,
      pricePerKg: pPrice,
      location: pLoc,
      description: pDesc,
      contactNumber: pPhone,
      createdAt: new Date().toLocaleDateString(),
      isSold: false
    };

    onAddItem(newItem);
    setPTitle("");
    setPDesc("");
    setShowAddForm(false);
    setSuccessMsg("Your produce listing is now live.");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleAddRental = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rDesc) return;

    const newEq: Equipment = {
      id: "eq-" + Math.random().toString(36).substr(2, 9),
      ownerId: "curr-farmer",
      ownerName: "Kavitha Patel",
      name: rName,
      type: "Tractor",
      ratePerDay: rRate,
      location: rLoc,
      description: rDesc,
      contactNumber: rPhone,
      isAvailable: true
    };

    onAddEquipment(newEq);
    setRName("");
    setRDesc("");
    setShowAddForm(false);
    setSuccessMsg("Your equipment is now listed for rent.");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const tabs = [
    { id: "produce" as const, label: "Produce", count: items.length, Icon: SeedIcon },
    { id: "rental" as const, label: "Equipment rentals", count: equipmentList.length, Icon: TractorIcon }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            {activeTab === "produce" ? (
              <MarketIcon className="w-6 h-6" animate />
            ) : (
              <TractorIcon className="w-6 h-6" animate />
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Trade</p>
            <h2 className="text-3xl text-slate-900 mt-0.5">Marketplace</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Sell produce directly to buyers, or rent farm equipment from growers nearby.
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowAddForm(!showAddForm)}
          whileTap={{ scale: 0.97 }}
          className={`${primaryBtn} shrink-0 self-start md:self-auto`}
        >
          <motion.span
            className="inline-flex"
            animate={{ rotate: showAddForm ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            <PlusIcon className="w-4 h-4" />
          </motion.span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={showAddForm ? "close" : activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              {showAddForm ? "Cancel" : activeTab === "produce" ? "List produce" : "List equipment"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {successMsg && (
          <Collapse key="success">
            <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          </Collapse>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1" role="tablist">
        {tabs.map(({ id, label, count, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => { setActiveTab(id); setShowAddForm(false); }}
              className={`relative flex items-center gap-2 px-3.5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                active ? "text-emerald-800" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" mono={!active} />
              {label}
              <span
                className={`tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
              {active && (
                <motion.span
                  layoutId="marketplace-tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-700 rounded-full"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Listing form */}
      <AnimatePresence initial={false}>
        {showAddForm && (
          <Collapse key={`form-${activeTab}`}>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-2xl">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {activeTab === "produce" ? "New produce listing" : "New equipment listing"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === "produce"
                    ? "Buyers will see the price, quantity and your contact number."
                    : "Growers nearby can book the machine at the daily rate you set."}
                </p>
              </div>

              {activeTab === "produce" ? (
                <motion.form onSubmit={handleAddProduce} variants={formVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Listing title</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic basmati rice, 2026 harvest"
                      value={pTitle}
                      onChange={(e) => setPTitle(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Crop</label>
                    <select value={pCrop} onChange={(e) => setPCrop(e.target.value)} className={inputClass}>
                      <option value="Basmati Rice">Basmati Rice</option>
                      <option value="Sona Masuri">Sona Masuri Paddy</option>
                      <option value="Durum Wheat">Durum Wheat</option>
                      <option value="Desi Chana">Desi Chana</option>
                    </select>
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Quantity available (kg)</label>
                    <input
                      type="number"
                      value={pQty}
                      onChange={(e) => setPQty(parseInt(e.target.value))}
                      className={`${inputClass} tabular-nums`}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Price (₹ per kg)</label>
                    <input
                      type="number"
                      value={pPrice}
                      onChange={(e) => setPPrice(parseInt(e.target.value))}
                      className={`${inputClass} tabular-nums`}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Pickup location</label>
                    <input type="text" value={pLoc} onChange={(e) => setPLoc(e.target.value)} className={inputClass} />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Contact number</label>
                    <input type="text" value={pPhone} onChange={(e) => setPPhone(e.target.value)} className={inputClass} />
                  </motion.div>

                  <motion.div variants={fieldItem} className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Grown with vermicompost, moisture kept below 12% in storage."
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      className={`${inputClass} resize-y`}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldItem} className="md:col-span-2 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" className={primaryBtn}>
                      Publish listing
                    </button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.form onSubmit={handleAddRental} variants={formVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Machine name and model</label>
                    <input
                      type="text"
                      placeholder="e.g. Mahindra Arjun 605"
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Rate (₹ per day)</label>
                    <input
                      type="number"
                      value={rRate}
                      onChange={(e) => setRRate(parseInt(e.target.value))}
                      className={`${inputClass} tabular-nums`}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Pickup location</label>
                    <input type="text" value={rLoc} onChange={(e) => setRLoc(e.target.value)} className={inputClass} />
                  </motion.div>

                  <motion.div variants={fieldItem}>
                    <label className={labelClass}>Contact number</label>
                    <input type="text" value={rPhone} onChange={(e) => setRPhone(e.target.value)} className={inputClass} />
                  </motion.div>

                  <motion.div variants={fieldItem} className="md:col-span-2">
                    <label className={labelClass}>Description and attachments</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Comes with a rotavator attachment. Serviced last month."
                      value={rDesc}
                      onChange={(e) => setRDesc(e.target.value)}
                      className={`${inputClass} resize-y`}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fieldItem} className="md:col-span-2 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" className={primaryBtn}>
                      Publish listing
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </div>
          </Collapse>
        )}
      </AnimatePresence>

      {/* Listing grids */}
      <div>
        <AnimatePresence mode="wait">
          {/* 1. Produce */}
          {activeTab === "produce" && (
            items.length === 0 ? (
              <motion.div key="produce-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={<SeedIcon className="w-7 h-7" animate />}
                  title="No produce listed yet"
                  body="Post your first harvest so buyers in your area can contact you directly."
                />
              </motion.div>
            ) : (
              <motion.div key="produce" variants={gridVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    // Wrapper carries the motion transform/layout so the card's CSS hover lift stays intact
                    <motion.div
                      key={item.id}
                      layout
                      variants={riseItem}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="h-full"
                    >
                      <article className="h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                            {item.cropName}
                          </span>
                          {item.isSold ? (
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">Sold</span>
                          ) : (
                            <span className="text-slate-400 tabular-nums">{item.createdAt}</span>
                          )}
                        </div>

                        <h3 className="mt-3 text-base font-semibold text-slate-900 leading-snug">{item.title}</h3>
                        {item.variety && <p className="text-xs text-slate-500 mt-0.5">{item.variety}</p>}

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Price</p>
                            <p className="text-2xl font-semibold text-slate-900 tabular-nums leading-tight">
                              {formatRupees(item.pricePerKg)}
                              <span className="text-sm font-medium text-slate-500"> / kg</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Available</p>
                            <p className="text-sm font-semibold text-slate-800 tabular-nums">
                              {item.quantityKg?.toLocaleString("en-IN")} kg
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3">{item.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {item.farmerName}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-400 tabular-nums truncate">{item.contactNumber}</span>
                            <a
                              href={`tel:${item.contactNumber}`}
                              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Call seller
                            </a>
                          </div>
                        </div>
                      </article>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )
          )}

          {/* 2. Rentals */}
          {activeTab === "rental" && (
            equipmentList.length === 0 ? (
              <motion.div key="rental-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  icon={<TractorIcon className="w-7 h-7" animate />}
                  title="No equipment listed yet"
                  body="List a tractor or implement so growers nearby can book it by the day."
                />
              </motion.div>
            ) : (
              <motion.div key="rental" variants={gridVariants} initial="hidden" animate="show" exit="exit" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {equipmentList.map((eq) => (
                    // Wrapper carries the motion transform/layout so the card's CSS hover lift stays intact
                    <motion.div
                      key={eq.id}
                      layout
                      variants={riseItem}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      className="h-full"
                    >
                      <article className="h-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <TractorIcon className="w-5 h-5" mono />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-slate-900 leading-snug">{eq.name}</h3>
                              <p className="text-xs text-slate-500 mt-0.5">{eq.type}</p>
                            </div>
                          </div>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={eq.isAvailable ? "available" : "booked"}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`shrink-0 inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md font-medium ${
                                eq.isAvailable ? "bg-emerald-50 text-emerald-800" : "bg-harvest-50 text-harvest-600"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${eq.isAvailable ? "bg-emerald-500" : "bg-harvest-500"}`} />
                              {eq.isAvailable ? "Available" : "Booked"}
                            </motion.span>
                          </AnimatePresence>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-slate-500">Daily rate</p>
                          <p className="text-2xl font-semibold text-slate-900 tabular-nums leading-tight">
                            {formatRupees(eq.ratePerDay)}
                            <span className="text-sm font-medium text-slate-500"> / day</span>
                          </p>
                        </div>

                        <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3">{eq.description}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {eq.ownerName}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {eq.location}</span>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <a
                              href={`tel:${eq.contactNumber}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-800 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call owner
                            </a>
                            <AnimatePresence mode="wait" initial={false}>
                              {eq.isAvailable ? (
                                <motion.button
                                  key="rent"
                                  onClick={() => onBookEquipment(eq.id)}
                                  whileTap={{ scale: 0.97 }}
                                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                >
                                  Book now
                                </motion.button>
                              ) : (
                                <motion.span
                                  key="reserved"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-xs font-medium text-slate-400 px-3 py-2"
                                >
                                  Reserved
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </article>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">{icon}</div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{body}</p>
    </div>
  );
}
