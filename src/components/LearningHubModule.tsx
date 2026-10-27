/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Clock, Download, ExternalLink, Landmark } from "lucide-react";
import { motion, Variants } from "motion/react";
import { staggerContainer, riseItem } from "./MotionKit";
import { LearnIcon, ArrowIcon } from "./icons";

// Scheme cards fade in slightly after the article column
const schemeList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

export default function LearningHubModule() {
  const articles = [
    {
      title: "Sustainable Soil Biology: A Deep Dive into Organic Humus",
      category: "Soil Health",
      desc: "Learn agronomic practices to cultivate underground microbial grids. Understand soil composting, nitrogen fixation, and vermiculture.",
      duration: "12 min read"
    },
    {
      title: "Transitioning to High-Yield Micro-Drip Irrigation Systems",
      category: "Irrigation Systems",
      desc: "An engineering breakdown of pressure valves, drip lines, evaporation curves, and water distribution for clay sand plots.",
      duration: "18 min read"
    },
    {
      title: "Natural Pest Defenses: Multi-Cropping and Border Sowing",
      category: "Organic Farming",
      desc: "Sow companion botanical blocks like Calendula or Coriander around cash grids to deter local insect migrations naturally.",
      duration: "15 min read"
    }
  ];

  const schemes = [
    {
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      dept: "Ministry of Agriculture & Farmers Welfare",
      desc: "Financial assistance program providing ₹6,000 per year in three equal installments directly into land-holding farmer accounts.",
      action: "https://pmkisan.gov.in/"
    },
    {
      name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
      dept: "Central Insurance Registry",
      desc: "Low-premium state-sponsored crop insurance covering yield loss due to localized drought, flood, storm, or pest outbreaks.",
      action: "https://pmfby.gov.in/"
    },
    {
      name: "Soil Health Card (SHC) Scheme",
      dept: "Department of Soil & Fertilizer",
      desc: "Provides free analytical test reports detailing N-P-K nutrient levels, micro-mineral deficits, and dynamic recommendations.",
      action: "https://soilhealth.dac.gov.in/"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <LearnIcon className="w-6 h-6" animate />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Knowledge</p>
          <h2 className="text-3xl text-slate-900 mt-0.5">Learning Hub</h2>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            Practical guides on modern and organic farming, plus government schemes you may qualify for.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guides */}
        <motion.section
          className="lg:col-span-2"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          aria-labelledby="guides-heading"
        >
          <div className="flex items-baseline justify-between mb-4">
            <h3 id="guides-heading" className="text-sm font-semibold text-slate-900">Guides</h3>
            <span className="text-xs text-slate-500 tabular-nums">{articles.length} articles</span>
          </div>

          <div className="space-y-4">
            {articles.map((art, idx) => (
              // Motion wrapper keeps its transform off the card so the shared CSS hover lift still applies
              <motion.div key={idx} variants={riseItem}>
                <article className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-emerald-200 transition-colors">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">{art.category}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500 tabular-nums">
                      <Clock className="w-3.5 h-3.5" /> {art.duration}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                    {art.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-prose">{art.desc}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => alert("Simulated Course download triggered! Resource file: " + art.title + ".pdf")}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <ArrowIcon className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Schemes */}
        <motion.section
          className="lg:col-span-1"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          aria-labelledby="schemes-heading"
        >
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-4 h-4 text-emerald-700" />
            <h3 id="schemes-heading" className="text-sm font-semibold text-slate-900">Government schemes</h3>
          </div>

          <motion.div variants={schemeList} className="space-y-4">
            {schemes.map((scm, idx) => (
              <motion.div key={idx} variants={riseItem}>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <p className="text-xs text-slate-500">{scm.dept}</p>
                  <h4 className="mt-1 text-sm font-semibold text-slate-900 leading-snug">{scm.name}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{scm.desc}</p>
                  <a
                    href={scm.action}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Visit official site
                    <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
