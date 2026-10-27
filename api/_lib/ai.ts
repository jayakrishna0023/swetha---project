/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared AI logic for the serverless functions in /api (Vercel) and the local Vite dev middleware.
// The Groq key is read from the environment only: it is never sent to the browser or committed.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const VISION_MODEL = () => process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

export const aiLive = () => !!process.env.GROQ_API_KEY;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: any };

async function groq(messages: ChatMessage[], opts: { json?: boolean; vision?: boolean; maxTokens?: number } = {}) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.vision ? VISION_MODEL() : TEXT_MODEL(),
      messages,
      temperature: 0.4,
      max_tokens: opts.maxTokens ?? 1200,
      ...(opts.json ? { response_format: { type: "json_object" } } : {})
    })
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Groq error", res.status, data?.error?.message);
    throw new HttpError(res.status === 429 ? 429 : 502, res.status === 429 ? "The AI service is busy. Please try again in a minute." : "The AI service couldn't answer right now. Please try again.");
  }
  // Some reasoning models wrap thinking in <think> tags; strip it from the visible answer
  return String(data.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new HttpError(502, "The AI returned an unexpected answer. Please try again.");
  }
}

const str = (v: unknown, fallback = "") => (typeof v === "string" && v.trim() ? v.trim() : fallback);
const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : []);
const clip = (v: unknown, max: number) => String(v ?? "").slice(0, max);

const ADVISOR_SYSTEM =
  "You are AgriSphere AI, an experienced agronomist advising farmers, mostly in India. Give practical, scientifically accurate, organic-first advice. Use local units (acre, quintal, kg, ₹) and Indian seasons (Kharif, Rabi, Zaid) where relevant. Be concise.";

// ---------------------------------------------------------------------------
// 1. Chat assistant
// ---------------------------------------------------------------------------
export async function chat(body: any) {
  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) throw new HttpError(400, "Invalid messages format");
  const history: ChatMessage[] = messages.slice(-12).map((m: any) => ({
    role: m?.role === "user" ? "user" : "assistant",
    content: clip(m?.content ?? m?.text, 4000)
  }));

  if (!aiLive()) {
    const last = String(history[history.length - 1]?.content || "").toLowerCase();
    let reply = "AI is in demo mode. Add GROQ_API_KEY to enable live answers. Tip: rotating legumes after wheat restores soil nitrogen naturally.";
    if (/disease|leaf|sick/.test(last)) reply = "Look for signs of rust or leaf spot. Keep at least 15 cm spacing so leaves dry quickly. Which crop are you growing?";
    else if (/fertili|soil|npk/.test(last)) reply = "Use well-rotted compost or vermicompost, and neem cake at about 200 kg/acre. Green manure such as sunn hemp before the main crop adds nitrogen.";
    else if (/scheme|government|subsidy/.test(last)) reply = "Key schemes:\n1. **PM-KISAN**: ₹6,000/year income support.\n2. **PMFBY**: low-premium crop insurance.\n3. **Soil Health Card**: free soil testing.";
    return { response: reply, isMock: true };
  }

  const text = await groq(
    [{ role: "system", content: `${ADVISOR_SYSTEM} Format answers in short markdown: brief paragraphs, bullet lists, **bold** for key numbers.` }, ...history],
    { maxTokens: 900 }
  );
  return { response: text || "Sorry, I couldn't come up with an answer. Please rephrase.", isMock: false };
}

// ---------------------------------------------------------------------------
// 2. Crop recommendation
// ---------------------------------------------------------------------------
export async function cropRecommend(body: any) {
  const { location, season, soilType, budget, waterAvailability, previousCrop } = body || {};
  if (!aiLive()) {
    return {
      bestCrop: String(soilType || "").toLowerCase().includes("clay") ? "Rice (Paddy)" : "Maize (Corn)",
      expectedYield: "24-28 quintals per acre",
      expectedProfit: "₹45,000 - ₹62,000 per acre",
      growingTips: [
        "Maintain 2-5 cm standing water during the early transplanting stage.",
        "Apply neem-coated urea in three split doses: transplanting, tillering and panicle initiation.",
        "Weed twice, at 20 and 40 days after sowing."
      ],
      budgetAllocation: { seeds: "15%", fertilizers: "30%", irrigation: "20%", labour: "25%", miscellaneous: "10%" },
      alternatives: ["Soybean", "Black Gram"],
      isMock: true
    };
  }

  const prompt = `Recommend the single best crop for these conditions:
Location: ${clip(location || "Northern plains, India", 120)}
Season: ${clip(season || "Kharif (Monsoon)", 60)}
Soil type: ${clip(soilType || "Alluvial clay loam", 60)}
Budget: ${clip(budget || "Medium (₹20,000/acre)", 60)}
Water availability: ${clip(waterAvailability || "High", 60)}
Previous crop: ${clip(previousCrop || "Wheat", 60)}

Reply with JSON only, exactly this shape:
{"bestCrop": string, "expectedYield": string (range per acre, e.g. "25-30 quintals per acre"), "expectedProfit": string (net ₹ range per acre), "growingTips": string[3-4], "budgetAllocation": {"seeds": "NN%", "fertilizers": "NN%", "irrigation": "NN%", "labour": "NN%", "miscellaneous": "NN%"} (sums to 100%), "alternatives": string[2-3]}`;

  const r = parseJson(await groq([{ role: "system", content: ADVISOR_SYSTEM }, { role: "user", content: prompt }], { json: true }));
  const b = r.budgetAllocation || {};
  return {
    bestCrop: str(r.bestCrop, "No clear recommendation"),
    expectedYield: str(r.expectedYield, "—"),
    expectedProfit: str(r.expectedProfit, "—"),
    growingTips: list(r.growingTips).slice(0, 5),
    budgetAllocation: {
      seeds: str(b.seeds, "—"),
      fertilizers: str(b.fertilizers, "—"),
      irrigation: str(b.irrigation, "—"),
      labour: str(b.labour, "—"),
      miscellaneous: str(b.miscellaneous, "—")
    },
    alternatives: list(r.alternatives).slice(0, 3),
    isMock: false
  };
}

// ---------------------------------------------------------------------------
// 3. Leaf disease detection (vision)
// ---------------------------------------------------------------------------
export async function diseaseDetect(body: any) {
  const { imageBase64, cropType } = body || {};
  if (!imageBase64 || typeof imageBase64 !== "string") throw new HttpError(400, "imageBase64 is required");

  if (!aiLive()) {
    return {
      diseaseName: "Early Blight (Alternaria solani)",
      confidenceScore: "94.5%",
      causes: "High humidity, long leaf wetness and moderate temperatures (24-29°C) favour this fungus.",
      treatment: "Spray copper oxychloride (0.3%) or mancozeb (0.2%) every 15 days.",
      organicSolution: "Spray Pseudomonas fluorescens (0.2%) or 1% neem oil at the first sign of dark concentric rings.",
      preventionTips: ["Widen spacing so the canopy dries quickly.", "Use drip instead of overhead irrigation.", "Destroy infected residue and rotate with legumes."],
      isMock: true
    };
  }

  const mime = imageBase64.match(/^data:(image\/[\w+.-]+);base64,/)?.[1] || "image/jpeg";
  const data = imageBase64.replace(/^data:image\/[\w+.-]+;base64,/, "");
  const prompt = `Examine this ${clip(cropType || "crop", 60)} leaf. Identify any disease, pest damage or nutrient deficiency (or say it is healthy).
Reply with JSON only, exactly this shape:
{"diseaseName": string (or "Healthy"), "confidenceScore": string (e.g. "86%"), "causes": string, "treatment": string (chemical/conventional, with doses), "organicSolution": string (biological/organic, with doses), "preventionTips": string[3]}`;

  const r = parseJson(
    await groq(
      [
        { role: "system", content: `${ADVISOR_SYSTEM} You are also a plant pathologist.` },
        { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:${mime};base64,${data}` } }] }
      ],
      { json: true, vision: true }
    )
  );
  return {
    diseaseName: str(r.diseaseName, "Unclear"),
    confidenceScore: str(String(r.confidenceScore ?? ""), "—"),
    causes: str(r.causes, "—"),
    treatment: str(r.treatment, "—"),
    organicSolution: str(r.organicSolution, "—"),
    preventionTips: list(r.preventionTips).slice(0, 4),
    isMock: false
  };
}

// ---------------------------------------------------------------------------
// 4. Fertilizer plan
// ---------------------------------------------------------------------------
export async function fertilizer(body: any) {
  const { crop, soilType, stage } = body || {};
  if (!aiLive()) {
    return {
      recommendedFertilizer: "NPK 19-19-19 starter blend",
      quantity: "50 kg per acre",
      schedule: ["Basal: 20 kg at sowing or transplanting.", "First top dressing: 15 kg at 25-30 days.", "Second top dressing: 15 kg before flowering."],
      organicAlternatives: ["Farmyard manure at 5 tonnes/acre.", "Jeevamrutha with irrigation water at 200 litres/acre.", "Bone meal (phosphorus) at 100 kg/acre."],
      isMock: true
    };
  }

  const prompt = `Recommend a fertilizer plan for:
Crop: ${clip(crop || "Tomato", 60)}
Soil type: ${clip(soilType || "Sandy loam", 60)}
Growth stage: ${clip(stage || "Vegetative", 60)}

Reply with JSON only, exactly this shape:
{"recommendedFertilizer": string, "quantity": string (per acre), "schedule": string[3-4] (staged applications), "organicAlternatives": string[3]}`;

  const r = parseJson(await groq([{ role: "system", content: ADVISOR_SYSTEM }, { role: "user", content: prompt }], { json: true }));
  return {
    recommendedFertilizer: str(r.recommendedFertilizer, "—"),
    quantity: str(r.quantity, "—"),
    schedule: list(r.schedule).slice(0, 5),
    organicAlternatives: list(r.organicAlternatives).slice(0, 4),
    isMock: false
  };
}

// ---------------------------------------------------------------------------
// Request guard shared by every endpoint
// ---------------------------------------------------------------------------
const hits = new Map<string, { count: number; resetAt: number }>();

// Light abuse protection: same-site requests only, and a per-IP rate limit per instance
export function guard(headers: Record<string, any>, ip: string) {
  const origin = String(headers.origin || "");
  const host = String(headers["x-forwarded-host"] || headers.host || "");
  if (origin && host && new URL(origin).host !== host) throw new HttpError(403, "Requests from other sites are not allowed.");

  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) hits.set(ip, { count: 1, resetAt: now + 60_000 });
  else if (++entry.count > 20) throw new HttpError(429, "Too many requests. Please wait a minute and try again.");
}

export const routes: Record<string, (body: any) => Promise<unknown>> = {
  chat,
  "crop-recommend": cropRecommend,
  "disease-detect": diseaseDetect,
  fertilizer
};
