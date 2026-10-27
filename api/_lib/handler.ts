/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { routes, guard, HttpError, aiLive } from "./ai";

// Vercel Node.js function adapter: (req, res) with req.body already parsed as JSON
export function makeHandler(route: keyof typeof routes) {
  return async function handler(req: any, res: any) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    try {
      const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
      guard(req.headers, ip);
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      res.status(200).json(await routes[route](body));
    } catch (e: any) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      res.status(status).json({ error: status === 500 ? "Something went wrong. Please try again." : e.message });
    }
  };
}

export function healthHandler(_req: any, res: any) {
  res.status(200).json({ ok: true, aiLive: aiLive(), provider: "groq" });
}
