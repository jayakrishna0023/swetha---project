/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Expense } from "../types";
import { Trash2, Download, X } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform, Variants } from "motion/react";
import { staggerContainer } from "./MotionKit";
import { downloadCsv } from "../csv";
import { LedgerIcon, PlusIcon, ArrowIcon } from "./icons";

interface FinancialModuleProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
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

// Ledger rows fade in with a short slide
const ledgerRow: Variants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } }
};

// Forecast figures rise in sequence
const forecastItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } }
};

// Category colours for the breakdown strip (forest / harvest / soil family)
const categoryColors: Record<string, string> = {
  Seeds: "bg-emerald-700",
  Fertilizers: "bg-emerald-500",
  Labour: "bg-harvest-500",
  Machinery: "bg-soil-500",
  Transport: "bg-harvest-400",
  "Water/Irrigation": "bg-sky-500",
  Miscellaneous: "bg-slate-300"
};

// Number that springs to its new value whenever it changes
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20, mass: 0.8 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "text-xs font-medium text-slate-600";

export default function FinancialModule({ expenses, onAddExpense, onDeleteExpense }: FinancialModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<Expense["category"]>("Seeds");
  const [amount, setAmount] = useState(2500);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Yield predictor state
  const [ypCrop, setYpCrop] = useState("Paddy (Rice)");
  const [ypArea, setYpArea] = useState(2);
  const [ypSeedCost, setYpSeedCost] = useState(5000);
  const [ypFertilizerCost, setYpFertilizerCost] = useState(8000);
  const [ypLabourCost, setYpLabourCost] = useState(6000);
  const [ypOutputPrice, setYpOutputPrice] = useState(4200); // per quintal
  const [ypPrediction, setYpPrediction] = useState<any>(null);

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      alert("Amount, description, and date are required.");
      return;
    }

    const newExpense: Expense = {
      id: "exp-" + Math.random().toString(36).substr(2, 9),
      farmId: "curr-farm",
      category,
      amount,
      date,
      description
    };

    onAddExpense(newExpense);
    setDescription("");
    setAmount(2500);
    setDate("");
    setShowAddForm(false);
  };

  const handlePredictYield = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified agronomic prediction matrix
    const avgYieldPerAcre: Record<string, number> = {
      "Paddy (Rice)": 26, // Quintals
      Wheat: 22,
      Tomato: 140, // higher water/heavy weight
      Cotton: 12
    };

    const yieldFactor = avgYieldPerAcre[ypCrop] || 20;
    const estimatedQtyQuintals = yieldFactor * ypArea;
    const grossIncome = estimatedQtyQuintals * ypOutputPrice;
    const totalExpenses = ypSeedCost + ypFertilizerCost + ypLabourCost;
    const netProfit = grossIncome - totalExpenses;

    setYpPrediction({
      qty: estimatedQtyQuintals,
      gross: grossIncome,
      expenses: totalExpenses,
      net: netProfit,
      roi: Math.round((netProfit / totalExpenses) * 100)
    });
  };

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Categorized sum
  const categoriesSum = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Share of gross income kept as profit, for the forecast margin bar
  const marginPct = ypPrediction && ypPrediction.gross > 0
    ? Math.min(100, Math.max(0, (ypPrediction.net / ypPrediction.gross) * 100))
    : 0;

  const sortedCategories = Object.entries(categoriesSum).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <LedgerIcon className="w-6 h-6" animate />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Farm finances</span>
            <h2 className="text-3xl text-slate-900 mt-0.5">Expenses & Profit Forecast</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Record what you spend on each plot and estimate the return on your next harvest.
            </p>
          </div>
        </div>
        <button
          disabled={expenses.length === 0}
          onClick={() =>
            downloadCsv(
              `agrisphere-expenses-${new Date().toISOString().slice(0, 10)}.csv`,
              ["Date", "Category", "Description", "Amount (INR)", "Farm ID"],
              expenses.map((e) => [e.date, e.category, e.description, e.amount, e.farmId])
            )
          }
          className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Ledger Panel Left */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Expense ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">Every input cost for the current season.</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                showAddForm
                  ? "bg-white border border-slate-200 hover:border-slate-300 text-slate-700"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              }`}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
              {showAddForm ? "Cancel" : "Add expense"}
            </button>
          </div>

          {/* Total + breakdown */}
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500">Total spent</span>
              <div className="text-3xl font-semibold text-slate-900 tabular-nums mt-0.5">
                ₹<AnimatedNumber value={totalExpenseAmount} />
              </div>
            </div>

            {totalExpenseAmount > 0 && (
              <>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 gap-px">
                  {sortedCategories.map(([cat, sum], i) => (
                    <motion.div
                      key={cat}
                      title={`${cat}: ₹${sum.toLocaleString()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(sum / totalExpenseAmount) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: easeOut }}
                      className={`h-full ${categoryColors[cat] || "bg-slate-300"}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  {sortedCategories.map(([cat, sum]) => (
                    <span key={cat} className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${categoryColors[cat] || "bg-slate-300"}`} />
                      {cat}
                      <span className="text-slate-400 tabular-nums">{Math.round((sum / totalExpenseAmount) * 100)}%</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showAddForm && (
              <motion.div
                key="expense-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: easeOut }}
                className="overflow-hidden"
              >
                <motion.form
                  variants={formFields}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleSubmitExpense}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <motion.div variants={fieldItem} className="space-y-1.5">
                    <label className={labelClass}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Expense["category"])}
                      className={inputClass}
                    >
                      <option value="Seeds">Seeds</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Labour">Labour</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Transport">Transport</option>
                      <option value="Water/Irrigation">Water/Irrigation</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </motion.div>

                  <motion.div variants={fieldItem} className="space-y-1.5">
                    <label className={labelClass}>Amount (₹)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value))}
                      className={`${inputClass} tabular-nums`}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem} className="space-y-1.5">
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem} className="space-y-1.5">
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      placeholder="e.g. 10 bags organic urea"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={inputClass}
                    />
                  </motion.div>

                  <motion.div variants={fieldItem} className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Save expense
                    </button>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expense list */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="relative max-h-[340px] overflow-y-auto overflow-x-hidden -mx-2 px-2 divide-y divide-slate-100 border-t border-slate-100"
          >
            <AnimatePresence mode="popLayout">
              {expenses.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <LedgerIcon className="w-5 h-5" animate />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">No expenses recorded</p>
                  <p className="text-sm text-slate-500 mt-1">Log seed, fertiliser, labour and other costs to see where your money goes.</p>
                  {!showAddForm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-4 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add expense
                    </button>
                  )}
                </motion.div>
              ) : (
                expenses.map((exp) => (
                  <motion.div
                    key={exp.id}
                    layout
                    variants={ledgerRow}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="group flex justify-between items-center gap-3 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${categoryColors[exp.category] || "bg-slate-300"}`} />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-slate-900 block truncate">{exp.description}</span>
                        <span className="text-xs text-slate-500 tabular-nums">
                          {exp.category} · {exp.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">₹{exp.amount.toLocaleString()}</span>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                        aria-label={`Delete ${exp.description}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Forecast Predictor Panel Right */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Profit estimator</h3>
              <p className="text-xs text-slate-500 mt-0.5">A rough return based on typical yields per acre.</p>
            </div>
            <form onSubmit={handlePredictYield} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Crop</label>
                  <select
                    value={ypCrop}
                    onChange={(e) => setYpCrop(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Paddy (Rice)">Paddy (Rice)</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Tomato">Tomato</option>
                    <option value="Cotton">Cotton</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Area (acres)</label>
                  <input
                    type="number"
                    value={ypArea}
                    onChange={(e) => setYpArea(parseInt(e.target.value))}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className={labelClass}>Seeds (₹)</label>
                  <input
                    type="number"
                    value={ypSeedCost}
                    onChange={(e) => setYpSeedCost(parseInt(e.target.value))}
                    className={`${inputClass} px-3 tabular-nums`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Fertiliser (₹)</label>
                  <input
                    type="number"
                    value={ypFertilizerCost}
                    onChange={(e) => setYpFertilizerCost(parseInt(e.target.value))}
                    className={`${inputClass} px-3 tabular-nums`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Labour (₹)</label>
                  <input
                    type="number"
                    value={ypLabourCost}
                    onChange={(e) => setYpLabourCost(parseInt(e.target.value))}
                    className={`${inputClass} px-3 tabular-nums`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Expected selling price (₹ per quintal)</label>
                <input
                  type="number"
                  value={ypOutputPrice}
                  onChange={(e) => setYpOutputPrice(parseInt(e.target.value))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Estimate profit
                <ArrowIcon className="w-4 h-4" />
              </button>
            </form>
          </div>

          <AnimatePresence>
            {ypPrediction && (
              <motion.div
                key="forecast"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="overflow-hidden"
              >
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="relative overflow-hidden bg-emerald-900 text-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="field-rows absolute inset-0 pointer-events-none" aria-hidden />
                  <div className="relative space-y-5">
                    <motion.div variants={forecastItem}>
                      <h3 className="text-sm font-semibold text-white">Estimated outcome</h3>
                      <p className="text-xs text-emerald-200/80 mt-0.5">{ypCrop} on {ypArea} {ypArea === 1 ? "acre" : "acres"}</p>
                    </motion.div>

                    <motion.div variants={forecastItem}>
                      <span className="text-xs text-emerald-200/80">Net profit</span>
                      <div className={`text-3xl font-semibold tabular-nums mt-0.5 ${ypPrediction.net < 0 ? "text-rose-200" : "text-white"}`}>
                        ₹<AnimatedNumber value={ypPrediction.net} />
                      </div>
                    </motion.div>

                    <motion.div variants={forecastItem} className="grid grid-cols-3 gap-3 text-sm border-t border-white/10 pt-4">
                      <div>
                        <span className="text-xs text-emerald-200/80 block">Yield</span>
                        <span className="font-semibold tabular-nums block mt-0.5"><AnimatedNumber value={ypPrediction.qty} /> qtl</span>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-200/80 block">Gross value</span>
                        <span className="font-semibold tabular-nums block mt-0.5">₹<AnimatedNumber value={ypPrediction.gross} /></span>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-200/80 block">Return</span>
                        <span className="font-semibold tabular-nums block mt-0.5 text-harvest-400">
                          {ypPrediction.roi >= 0 ? "+" : ""}<AnimatedNumber value={ypPrediction.roi} />%
                        </span>
                      </div>
                    </motion.div>

                    {/* Profit margin meter: share of gross worth retained after costs */}
                    <motion.div variants={forecastItem} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-emerald-200/80">
                        <span>Profit margin</span>
                        <span className="tabular-nums">{Math.round(marginPct)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden" title="Profit margin of gross worth">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${marginPct}%` }}
                          transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.3 }}
                          className="h-full rounded-full bg-harvest-400"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
