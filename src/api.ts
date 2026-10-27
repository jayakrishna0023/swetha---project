/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { handlesRoute, localRequest, LocalError } from "./localBackend";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Called when any request comes back 401 (session expired / signed out elsewhere)
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

// Accounts and farm data are handled in the browser (see localBackend.ts);
// AI requests go to the serverless functions in /api.
export async function api<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = options.method || "GET";

  if (handlesRoute(path)) {
    try {
      return (await localRequest(path, method, options.body)) as T;
    } catch (e: any) {
      const status = e instanceof LocalError ? e.status : 500;
      if (status === 401 && !path.startsWith("/auth/")) onUnauthorized?.();
      throw new ApiError(e.message || "Something went wrong.", status);
    }
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data as T;
}
