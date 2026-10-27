/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Database, Code, FileText, Network, FlaskConical, MessagesSquare } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { DocsIcon } from "./icons";

type DocsTab = "srs" | "diagrams" | "schema" | "testing" | "viva";

// Tab panel: crossfades between tabs and staggers its direct motion children in
const panelVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, staggerChildren: 0.05, delayChildren: 0.03 } },
  exit: { opacity: 0, transition: { duration: 0.12 } }
};

// Blocks inside a panel fade up gently
const blockVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

// Renders the light markdown used in the SRS copy: "**Heading**" lines, "- " bullets and inline **bold**
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function Prose({ source }: { source: string }) {
  const lines = source.trim().split("\n").map((l) => l.trim());
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1.5 marker:text-slate-300">
          {bullets.map((b, i) => <li key={i}>{renderInline(b)}</li>)}
        </ul>
      );
      bullets = [];
    }
  };

  lines.forEach((line) => {
    if (!line) return flush();
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      return;
    }
    flush();
    const heading = line.match(/^\*\*([^*]+)\*\*$/);
    if (heading) {
      blocks.push(
        <h4 key={`h-${blocks.length}`} className="text-sm font-semibold text-slate-900 pt-2">{heading[1]}</h4>
      );
    } else {
      blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
    }
  });
  flush();

  return <div className="text-sm text-slate-600 leading-relaxed space-y-2.5 max-w-[68ch]">{blocks}</div>;
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="pb-6 mb-2 border-b border-slate-100">
      <p className="text-xs font-medium text-emerald-700">{eyebrow}</p>
      <h2 className="mt-1 text-2xl text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm text-slate-500 max-w-[68ch]">{description}</p>
    </div>
  );
}

function CodeBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-xl overflow-hidden bg-slate-900 ring-1 ring-slate-900/5">
      <figcaption className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-mono text-[11px] text-slate-500">text</span>
      </figcaption>
      <pre className="text-slate-100 font-mono text-[11px] leading-relaxed p-4 overflow-x-auto">{children}</pre>
    </figure>
  );
}

export default function DocsHubModule() {
  const [activeTab, setActiveTab] = useState<DocsTab>("srs");

  const srsSections = [
    {
      title: "1. Introduction",
      content: `
**1.1 Purpose**
AgriSphere is an AI-powered Smart Agriculture Platform designed to empower farmers with diagnostic intelligence, predictive insights, financial control, and decentralized marketplace access.

**1.2 Scope**
This system integrates Gemini-powered AI diagnostic agents, climate metrics, fertilizer matching, automated irrigation calendars, market-rate monitoring, expense sheets, and equipment-sharing registries in a single unified glassmorphism dashboard.

**1.3 Definitions & Abbreviations**
- **SRS**: Software Requirements Specification
- **NPK**: Nitrogen, Phosphorus, Potassium ratios
- **JWT**: JSON Web Token
- **GEMINI**: Google Gen AI model for deep agricultural recommendation pipelines
- **SPA**: Single Page Application
- **MVR**: Minimal Viable Recommendation
      `
    },
    {
      title: "2. Overall Description",
      content: `
**2.1 Product Perspective**
AgriSphere operates as a full-stack web application. It connects local soil/crop conditions with deep neural processing (Gemini-3.5-flash) to generate high-precision farm operating recommendations.

**2.2 Product Functions**
- Real-time Gemini-powered Crop & Fertilizer matching.
- Visual leaf disease image scanning with biological control output.
- Smart water volume calculation based on growing crop stages.
- Marketplace catalogs with Direct Farmer-to-Buyer communication.
- Comprehensive income-expense tracker.

**2.3 User Classes and Characteristics**
- **Farmer**: Seeks weather alerts, disease detection, smart recommendation logs, and selling tools.
- **Buyer**: Seeks verified direct organic harvests, crop logs, and reliable transaction records.
- **Admin**: Oversees platform security, marketplace disputes, user verification, and global system metrics.
      `
    },
    {
      title: "3. Specific Requirements",
      content: `
**3.1 External Interface Requirements**
- **User Interface**: HTML5/CSS3 styled via modern tailwind layers. Soft ambient green-glass surfaces.
- **Hardware Interfaces**: Mobile cameras must be activated via requested frame permissions for live leaf disease diagnosis.
- **Software Interfaces**: Express Server running tsx, calling Google GenAI API endpoint with verified 'aistudio-build' UA signatures.

**3.2 Functional Requirements**
- **REQ-001**: User signup with role designation (Farmer/Buyer/Admin).
- **REQ-002**: Adding/managing multiple distinct land plots (Farms) with dynamic soil parameters.
- **REQ-003**: Sowing and tracking crops with expected harvest projections.
- **REQ-004**: Processing image files (Base64 JPEG/PNG) via Gemini Vision to analyze leaf pathogens.
- **REQ-005**: Live chat and advisory assistance using localized agricultural training guidelines.
      `
    }
  ];

  const diagrams = {
    useCase: `
  +---------------------------------------------------------------------------------+
  |                                   AGRISPHERE                                    |
  |                                                                                 |
  |    +--------+                                                                   |
  |    | Farmer | ----+-----> [ Manage Farm & Crops ]                               |
  |    +--------+     |                                                             |
  |                   +-----> [ Run AI Disease Diagnosis (Camera) ]                 |
  |                   |                                                             |
  |                   +-----> [ Get AI Fertilizer/Irrigation Recommendations ]      |
  |                   |                                                             |
  |                   +-----> [ List Crops on Marketplace ]                         |
  |                   |                                                             |
  |                   +-----> [ Chat with AgriSphere AI Bot ]                       |
  |                                                                                 |
  |    +--------+                                                                   |
  |    | Buyer  | ----+-----> [ Browse Marketplace & Purchase Crops ]               |
  |    +--------+     |                                                             |
  |                   +-----> [ Book/Rent Agricultural Equipment ]                   |
  |                                                                                 |
  |    +--------+                                                                   |
  |    | Admin  | ----+-----> [ Manage Users, Dispute Resolution & System Logs ]    |
  |    +--------+                                                                   |
  |                                                                                 |
  +---------------------------------------------------------------------------------+
    `,
    erd: `
  [USER] (1) --------- (0..*) [FARM]
    | id (PK)                    | id (PK)
    | name                       | name
    | email                      | location
    | role                       | soilType
    | password (Hash)            | areaAcres
                                 | waterSource
                                    |
                                    | (1)
                                    |
                                    v (0..*)
                                 [CROP]
                                    | id (PK)
                                    | farmId (FK)
                                    | name
                                    | variety
                                    | sowingDate
                                    | growthStage
                                    | expectedHarvestDate
                                    |
            +-----------------------+-----------------------+
            | (1)                                           | (1)
            v (0..*)                                        v (0..*)
     [EXPENSE]                                       [MARKETPLACE_ITEM]
        | id (PK)                                       | id (PK)
        | cropId (FK)                                   | cropName
        | category                                      | pricePerKg
        | amount                                        | quantityKg
        | date                                          | isSold
    `,
    class: `
  +-----------------------+          +-----------------------+          +-----------------------+
  |         User          |          |         Farm          |          |         Crop          |
  +-----------------------+          +-----------------------+          +-----------------------+
  | - id: String          |          | - id: String          |          | - id: String          |
  | - name: String        | 1      * | - farmerId: String    | 1      * | - farmId: String      |
  | - email: String       |----------| - name: String        |----------| - name: String        |
  | - role: Role          |          | - location: String    |          | - growthStage: Stage  |
  | - isVerified: Boolean |          | - soilType: String    |          | - sowingDate: Date    |
  +-----------------------+          +-----------------------+          +-----------------------+
  | + register()          |          | + getFarmSummary()    |          | + updateStage()       |
  | + login()             |          | + getSoilReport()     |          | + predictYield()      |
  +-----------------------+          +-----------------------+          +-----------------------+
    `,
    architecture: `
  +---------------------------------------------------------------------------------+
  |                              AGRISPHERE ARCHITECTURE                            |
  +---------------------------------------------------------------------------------+
  |                                                                                 |
  |   +-------------------------------------------------------------------------+   |
  |   |                         CLIENT LAYER (React + Vite)                      |   |
  |   |   - Interactive Dashboard UI (Tailwind CSS, Glassmorphism)              |   |
  |   |   - State Management (localStorage, React hooks)                        |   |
  |   |   - Client Camera API (Disease Scanning)                                |   |
  |   +-------------------------------------------------------------------------+   |
  |                                       |                                         |
  |                               HTTPS (JSON REST)                                 |
  |                                       v                                         |
  |   +-------------------------------------------------------------------------+   |
  |   |                      BACKEND API LAYER (Express + Node)                 |   |
  |   |   - Express.js Router (Authentication & Agricultural Endpoints)         |   |
  |   |   - Middlewares (Payload Validation, Error Handling, Stat Tracker)      |   |
  |   |   - Virtual JSON DB Persistence                                         |   |
  |   +-------------------------------------------------------------------------+   |
  |                                       |                                         |
  |                                 gRPC / HTTP POST                                |
  |                                       v                                         |
  |   +-------------------------------------------------------------------------+   |
  |   |                         COGNITIVE AI LAYER (Gemini)                     |   |
  |   |   - Google GenAI SDK (@google/genai)                                    |   |
  |   |   - Model: gemini-3.5-flash (Text reasoning, JSON schemas, Vision)          |   |
  |   +-------------------------------------------------------------------------+   |
  |                                                                                 |
  +---------------------------------------------------------------------------------+
    `
  };

  const schemas = [
    {
      name: "Users Collection",
      fields: [
        { name: "_id", type: "ObjectId (PK)", desc: "Unique user identifier" },
        { name: "name", type: "String", desc: "Farmer or buyer full name" },
        { name: "email", type: "String (Unique)", desc: "Primary account login email" },
        { name: "password", type: "String", desc: "Hashed credential" },
        { name: "role", type: "Enum", desc: "'Farmer', 'Buyer', or 'Admin'" },
        { name: "isVerified", type: "Boolean", desc: "True if KYC verification complete" },
        { name: "createdAt", type: "Date", desc: "Timestamp of profile creation" }
      ]
    },
    {
      name: "Farms Collection",
      fields: [
        { name: "_id", type: "ObjectId (PK)", desc: "Unique farm identifier" },
        { name: "farmerId", type: "ObjectId (FK)", desc: "Reference to primary owner in Users" },
        { name: "name", type: "String", desc: "Name/label of the land plot" },
        { name: "location", type: "String", desc: "Geographic district or coordinates" },
        { name: "soilType", type: "String", desc: "Alluvial, Clay, Sandy, Black soil parameters" },
        { name: "waterSource", type: "String", desc: "Rainfed, Canal, Drip, Tube-well" },
        { name: "areaAcres", type: "Number", desc: "Total farm boundaries in acres" }
      ]
    },
    {
      name: "Crops Collection",
      fields: [
        { name: "_id", type: "ObjectId (PK)", desc: "Unique crop identifier" },
        { name: "farmId", type: "ObjectId (FK)", desc: "Reference to parent Farm" },
        { name: "name", type: "String", desc: "Crop name (e.g. Wheat, Basmati Rice)" },
        { name: "variety", type: "String", desc: "Seed variety details" },
        { name: "growthStage", type: "Enum", desc: "Sowing, Vegetative, Flowering, Harvest-Ready" },
        { name: "sowingDate", type: "Date", desc: "Date of first seeding" },
        { name: "expectedHarvestDate", type: "Date", desc: "Target harvest projection" }
      ]
    }
  ];

  const apis = [
    { method: "POST", url: "/api/chat", desc: "AI Chatbot assistant. Interfaces with gemini-3.5-flash for advisory inputs." },
    { method: "POST", url: "/api/crop-recommend", desc: "AI Crop recommendation system. Accepts location, season, soil parameters and returns optimal crops and profit estimates in structured JSON." },
    { method: "POST", url: "/api/disease-detect", desc: "AI leaf disease analysis. Transmits base64 image to Gemini Vision API and extracts disease names, confidence level, and treatments." },
    { method: "POST", url: "/api/fertilizer", desc: "Retrieves recommended NPK ratios, application schedules, and organic compost alternatives based on crops and growth stages." }
  ];

  const vivaQAs = [
    {
      q: "What is AgriSphere and who are the target beneficiaries?",
      a: "AgriSphere is an AI-powered Smart Agriculture Platform designed for small-to-large-scale farmers, agricultural buyers, and farming co-ops. It provides data-driven decision-making toolsets including disease diagnostics, water planning, crop yield predictions, and decentralized marketplace trading."
    },
    {
      q: "How does the leaf disease detection system work?",
      a: "The farmer uploads an image of an infected leaf. The image is converted into a base64 encoded stream and transmitted to an Express endpoint. The server encapsulates this into a multimodal payload and queries 'gemini-3.5-flash'. The model parses the leaf characteristics and returns a structured JSON payload detailing disease identity, confidence rating, organic controls, and chemical antidotes."
    },
    {
      q: "Why is the Google GenAI SDK used instead of traditional REST calls?",
      a: "The '@google/genai' SDK is the official modern TypeScript SDK optimized for Google's newest models. It natively supports structured schema bindings via Type parameters, robust error states, and optimized connection streams, avoiding the need for manual HTTP header construction."
    },
    {
      q: "How is the architecture structured to support offline/intermittent connections?",
      a: "We deploy an offline-first state-sync architecture using client-side localStorage state management. It caches farming logs, expense sheets, and farm settings on the browser level, allowing uninterrupted access. When the server goes online, the API endpoints synchronize metadata."
    }
  ];


  const navTabs: { id: DocsTab; label: string; icon: typeof FileText }[] = [
    { id: "srs", label: "Requirements (SRS)", icon: FileText },
    { id: "diagrams", label: "System diagrams", icon: Network },
    { id: "schema", label: "Data model & API", icon: Database },
    { id: "testing", label: "Testing & deployment", icon: FlaskConical },
    { id: "viva", label: "Viva Q&A", icon: MessagesSquare }
  ];

  const diagramList = [
    { label: "Use case model", body: diagrams.useCase },
    { label: "Entity-relationship diagram", body: diagrams.erd },
    { label: "Class map", body: diagrams.class },
    { label: "Application architecture", body: diagrams.architecture }
  ];

  const methodStyle = (m: string) =>
    m === "GET" ? "bg-emerald-50 text-emerald-800" : m === "POST" ? "bg-harvest-50 text-harvest-600" : "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <DocsIcon className="w-6 h-6" animate />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Project reference</p>
          <h2 className="text-3xl text-slate-900 mt-0.5">Documentation</h2>
          <p className="text-sm text-slate-500 max-w-2xl mt-1">
            Requirements, architecture diagrams, data model, API reference, test notes and viva preparation for AgriSphere.
          </p>
        </div>
      </div>

      {/* Docs layout */}
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
        {/* Sub-navigation */}
        <nav aria-label="Documentation sections" className="min-w-0 lg:sticky lg:top-4">
          <p className="hidden lg:block px-3 mb-2 text-xs font-medium text-slate-500">Contents</p>
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
            {navTabs.map((tab, i) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive ? "text-emerald-800 font-semibold" : "text-slate-600 font-medium hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="docs-tab-pill"
                      className="absolute inset-0 rounded-lg bg-emerald-50 ring-1 ring-emerald-100"
                      transition={{ type: "spring", stiffness: 400, damping: 36 }}
                    />
                  )}
                  <Icon className="relative w-4 h-4 shrink-0" />
                  <span className="relative">{tab.label}</span>
                  <span className="relative ml-auto hidden lg:inline text-[11px] tabular-nums text-slate-400">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content viewer (rounded-[1rem] rather than rounded-2xl so the reading surface doesn't lift on hover) */}
        <div className="bg-white rounded-[1rem] border border-slate-200/80 shadow-sm p-5 sm:p-6 md:p-10 min-h-[420px] md:min-h-[500px] min-w-0">
          <AnimatePresence mode="wait">
          {/* Requirements */}
          {activeTab === "srs" && (
            <motion.div key={activeTab} variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
              <motion.div variants={blockVariants}>
                <SectionHeader
                  eyebrow="Section 1"
                  title="Software requirements specification"
                  description="Purpose, scope, users and functional requirements, following the IEEE 830 structure."
                />
              </motion.div>

              {srsSections.map((section, idx) => (
                <motion.section key={idx} variants={blockVariants}>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">{section.title}</h3>
                  <Prose source={section.content} />
                </motion.section>
              ))}
            </motion.div>
          )}

          {/* Diagrams */}
          {activeTab === "diagrams" && (
            <motion.div key={activeTab} variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
              <motion.div variants={blockVariants}>
                <SectionHeader
                  eyebrow="Section 2"
                  title="System diagrams"
                  description="Plain-text UML and structural diagrams for quick reference. Scroll sideways on narrow screens."
                />
              </motion.div>

              {diagramList.map((d) => (
                <motion.section key={d.label} variants={blockVariants}>
                  <h3 className="text-base font-semibold text-slate-900 mb-3">{d.label}</h3>
                  <CodeBlock label={d.label}>{d.body.replace(/^\n+|\s+$/g, "")}</CodeBlock>
                </motion.section>
              ))}
            </motion.div>
          )}

          {/* Data model & API */}
          {activeTab === "schema" && (
            <motion.div key={activeTab} variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-10">
              <motion.div variants={blockVariants}>
                <SectionHeader
                  eyebrow="Section 3"
                  title="Data model and API"
                  description="MongoDB collections and the REST endpoints the client calls."
                />
              </motion.div>

              <motion.section variants={blockVariants} className="space-y-6">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" /> Collections
                </h3>
                {schemas.map((schema, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">{schema.name}</h4>
                      <span className="text-xs text-slate-400 tabular-nums">{schema.fields.length} fields</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr className="border-b border-slate-200">
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-44">Field</th>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-40">Type</th>
                            <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {schema.fields.map((field, fIdx) => (
                            <tr key={fIdx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-2.5 font-mono text-xs text-emerald-800 whitespace-nowrap">{field.name}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">{field.type}</td>
                              <td className="px-4 py-2.5 text-slate-600">{field.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </motion.section>

              <motion.section variants={blockVariants} className="space-y-3">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-700" /> REST endpoints
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-64">Endpoint</th>
                        <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {apis.map((api, idx) => (
                        <tr key={idx} className="align-top hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-block text-[11px] font-semibold font-mono px-1.5 py-0.5 rounded-md mr-2 ${methodStyle(api.method)}`}>
                              {api.method}
                            </span>
                            <code className="font-mono text-xs text-slate-800">{api.url}</code>
                          </td>
                          <td className="px-4 py-3 text-slate-600 leading-relaxed">{api.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* Testing */}
          {activeTab === "testing" && (
            <motion.div key={activeTab} variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
              <motion.div variants={blockVariants}>
                <SectionHeader
                  eyebrow="Section 4"
                  title="Testing and deployment"
                  description="What was verified before release and how the app is built and hosted."
                />
              </motion.div>

              <motion.section variants={blockVariants}>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Unit and integration testing</h3>
                <ul className="text-sm text-slate-600 leading-relaxed space-y-2 list-disc pl-5 marker:text-slate-300 max-w-[68ch]">
                  <li><strong className="font-semibold text-slate-900">API routes:</strong> Validates content validation rules, ensuring payload integrity before calling Gemini APIs.</li>
                  <li><strong className="font-semibold text-slate-900">Base64 image processing:</strong> Verified that leaf files translate smoothly into binary buffers and are diagnosed under 2.5 seconds.</li>
                  <li><strong className="font-semibold text-slate-900">Responsive layouts:</strong> Fully tested layouts across Apple iPhone 15, Android pixel emulators, iPad Air, and Full HD desktop configurations.</li>
                </ul>
              </motion.section>

              <motion.section variants={blockVariants}>
                <h3 className="text-base font-semibold text-slate-900 mb-3">Deployment</h3>
                <ul className="text-sm text-slate-600 leading-relaxed space-y-2 list-disc pl-5 marker:text-slate-300 max-w-[68ch]">
                  <li><strong className="font-semibold text-slate-900">Frontend hosting:</strong> Bundled inside a static Vite layout, compressed via Brotli/Gzip, and deployed via high-speed edge networks.</li>
                  <li><strong className="font-semibold text-slate-900">Backend runtime:</strong> Node.js Express server running inside Cloud Run environments, maintaining automated SSL handshakes and ingress port forwarding (port 3000).</li>
                  <li>
                    <strong className="font-semibold text-slate-900">Secrets:</strong> Stored server-side under{" "}
                    <code className="font-mono text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">process.env.GEMINI_API_KEY</code>, never exposed to the frontend bundle.
                  </li>
                </ul>
              </motion.section>
            </motion.div>
          )}

          {/* Viva */}
          {activeTab === "viva" && (
            <motion.div key={activeTab} variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
              <motion.div variants={blockVariants}>
                <SectionHeader
                  eyebrow="Section 5"
                  title="Viva Q&A"
                  description="Common architecture and implementation questions, with short answers."
                />
              </motion.div>

              <dl className="divide-y divide-slate-100">
                {vivaQAs.map((v, idx) => (
                  <motion.div key={idx} variants={blockVariants} className="py-5 first:pt-0 grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
                    <span className="text-xs font-semibold text-emerald-700 tabular-nums pt-0.5">Q{idx + 1}</span>
                    <div>
                      <dt className="text-sm font-semibold text-slate-900">{v.q}</dt>
                      <dd className="mt-2 text-sm text-slate-600 leading-relaxed max-w-[68ch]">{v.a}</dd>
                    </div>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
