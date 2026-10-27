/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Browser-side account and data store, so the app runs on static hosting (Vercel) with no server.
// Accounts and records live in this browser's localStorage; passwords are stored only as
// salted PBKDF2-SHA256 hashes. Mirrors the routes the app calls through api().
import { Role, MarketplaceItem, Equipment, CommunityPost } from "./types";
import { seedMarketplaceItems, seedEquipment, seedPosts } from "./seed";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  location?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface SharedData {
  marketplace: MarketplaceItem[];
  equipment: Equipment[];
  posts: CommunityPost[];
}

export class LocalError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const NS = "agrisphere:db:";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_DATA_KEYS = ["farms", "crops", "expenses", "readNotifications"] as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    throw new LocalError(507, "This browser's storage is full or blocked, so changes couldn't be saved.");
  }
}

const users = () => read<StoredUser[]>("users", []);
const shared = () => read<SharedData>("shared", { marketplace: seedMarketplaceItems, equipment: seedEquipment, posts: seedPosts });
const emptyUserData = () => ({ farms: [], crops: [], expenses: [], readNotifications: [] as string[] });
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function randomHex(bytes: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
}
const newId = (prefix: string) => `${prefix}-${randomHex(6)}`;

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210_000 },
    key,
    256
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time comparison of two hex strings
function sameHash(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function publicUser(u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    location: u.location,
    isVerified: false,
    memberSince: new Date(u.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  };
}

function currentUser(): StoredUser | null {
  const session = read<{ userId: string; expiresAt: number } | null>("session", null);
  if (!session || session.expiresAt < Date.now()) return null;
  return users().find((u) => u.id === session.userId) || null;
}

function requireUser() {
  const u = currentUser();
  if (!u) throw new LocalError(401, "Please sign in to continue.");
  return u;
}

const startSession = (userId: string) => write("session", { userId, expiresAt: Date.now() + SESSION_TTL_MS });

// Slow down repeated wrong passwords on this device
const failures = new Map<string, { count: number; until: number }>();

function updateShared(mutate: (s: SharedData) => unknown) {
  const s = shared();
  const result = mutate(s);
  write("shared", s);
  return result;
}

function findPost(s: SharedData, id: string) {
  const post = s.posts.find((p) => p.id === id);
  if (!post) throw new LocalError(404, "Post not found.");
  return post;
}

export function handlesRoute(path: string) {
  return /^\/(auth\/|data$|shared$|marketplace$|equipment|posts)/.test(path);
}

export async function localRequest(path: string, method: string, body: any): Promise<unknown> {
  const route = `${method} ${path.replace(/\/(eq|post)-[0-9a-f]+/, "/:id")}`;
  const idMatch = path.match(/\/((?:eq|post)-[0-9a-f]+)/);
  const id = idMatch?.[1] || "";

  switch (route) {
    case "POST /auth/signup": {
      const name = str(body?.name, 60);
      const email = str(body?.email, 120).toLowerCase();
      const password = typeof body?.password === "string" ? body.password : "";
      if (name.length < 2) throw new LocalError(400, "Please enter your full name.");
      if (!EMAIL_RE.test(email)) throw new LocalError(400, "Please enter a valid email address.");
      if (password.length < 8) throw new LocalError(400, "Password must be at least 8 characters.");
      const all = users();
      if (all.some((u) => u.email === email)) throw new LocalError(409, "An account with this email already exists. Try signing in.");
      const salt = randomHex(16);
      const user: StoredUser = {
        id: newId("usr"),
        name,
        email,
        role: body?.role === Role.BUYER ? Role.BUYER : Role.FARMER,
        location: str(body?.location, 80) || undefined,
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: new Date().toISOString()
      };
      write("users", [...all, user]);
      write(`data:${user.id}`, emptyUserData());
      startSession(user.id);
      return { user: publicUser(user) };
    }

    case "POST /auth/login": {
      const email = str(body?.email, 120).toLowerCase();
      const password = typeof body?.password === "string" ? body.password : "";
      const f = failures.get(email);
      if (f && f.count >= 5 && f.until > Date.now()) {
        throw new LocalError(429, `Too many attempts. Please wait ${Math.ceil((f.until - Date.now()) / 1000)} seconds.`);
      }
      const user = users().find((u) => u.email === email);
      const ok = !!user && sameHash(await hashPassword(password, user.salt), user.passwordHash);
      if (!ok) {
        const count = (f?.count || 0) + 1;
        failures.set(email, { count, until: Date.now() + Math.min(60_000, 2 ** count * 1000) });
        throw new LocalError(401, "Incorrect email or password.");
      }
      failures.delete(email);
      startSession(user!.id);
      return { user: publicUser(user!) };
    }

    case "POST /auth/logout":
      localStorage.removeItem(NS + "session");
      return { ok: true };

    case "GET /auth/me": {
      const u = currentUser();
      return { user: u ? publicUser(u) : null };
    }

    case "PATCH /auth/profile": {
      const me = requireUser();
      const all = users();
      const u = all.find((x) => x.id === me.id)!;
      const name = str(body?.name, 60);
      if (name.length >= 2) u.name = name;
      u.location = str(body?.location, 80) || undefined;
      write("users", all);
      return { user: publicUser(u) };
    }

    case "POST /auth/change-password": {
      const me = requireUser();
      if (typeof body?.currentPassword !== "string" || !sameHash(await hashPassword(body.currentPassword, me.salt), me.passwordHash)) {
        throw new LocalError(400, "Your current password is incorrect.");
      }
      if (typeof body?.newPassword !== "string" || body.newPassword.length < 8) {
        throw new LocalError(400, "New password must be at least 8 characters.");
      }
      const all = users();
      const u = all.find((x) => x.id === me.id)!;
      u.salt = randomHex(16);
      u.passwordHash = await hashPassword(body.newPassword, u.salt);
      write("users", all);
      return { ok: true };
    }

    case "GET /data":
      return { ...emptyUserData(), ...read(`data:${requireUser().id}`, {}) };

    case "PUT /data": {
      const me = requireUser();
      const current: any = { ...emptyUserData(), ...read(`data:${me.id}`, {}) };
      for (const key of USER_DATA_KEYS) if (Array.isArray(body?.[key])) current[key] = body[key].slice(0, 5000);
      write(`data:${me.id}`, current);
      return { ok: true };
    }

    case "GET /shared":
      requireUser();
      return shared();

    case "POST /marketplace": {
      const me = requireUser();
      const item: MarketplaceItem = {
        id: newId("prod"),
        farmerId: me.id,
        farmerName: me.name,
        title: str(body?.title, 120),
        cropName: str(body?.cropName, 80),
        variety: str(body?.variety, 80),
        quantityKg: Math.max(0, Number(body?.quantityKg) || 0),
        pricePerKg: Math.max(0, Number(body?.pricePerKg) || 0),
        location: str(body?.location, 120),
        description: str(body?.description, 1000),
        contactNumber: str(body?.contactNumber, 30),
        createdAt: new Date().toLocaleDateString("en-IN"),
        isSold: false
      };
      if (!item.title) throw new LocalError(400, "A listing title is required.");
      updateShared((s) => s.marketplace.unshift(item));
      return item;
    }

    case "POST /equipment": {
      const me = requireUser();
      const eq: Equipment = {
        id: newId("eq"),
        ownerId: me.id,
        ownerName: me.name,
        name: str(body?.name, 120),
        type: str(body?.type, 60),
        ratePerDay: Math.max(0, Number(body?.ratePerDay) || 0),
        location: str(body?.location, 120),
        description: str(body?.description, 1000),
        contactNumber: str(body?.contactNumber, 30),
        isAvailable: true
      };
      if (!eq.name) throw new LocalError(400, "Equipment name is required.");
      updateShared((s) => s.equipment.unshift(eq));
      return eq;
    }

    case "POST /equipment/:id/book": {
      const me = requireUser();
      return updateShared((s) => {
        const eq = s.equipment.find((e) => e.id === id);
        if (!eq) throw new LocalError(404, "That equipment listing no longer exists.");
        if (!eq.isAvailable) throw new LocalError(409, "This equipment is already booked.");
        if (eq.ownerId === me.id) throw new LocalError(400, "You can't book your own equipment.");
        eq.isAvailable = false;
        return eq;
      });
    }

    case "POST /posts": {
      const me = requireUser();
      const post: CommunityPost = {
        id: newId("post"),
        authorId: me.id,
        authorName: me.name,
        authorRole: me.role,
        title: str(body?.title, 160),
        content: str(body?.content, 4000),
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: new Date().toLocaleDateString("en-IN"),
        tags: Array.isArray(body?.tags) ? body.tags.slice(0, 5).map((t: unknown) => str(t, 30)).filter(Boolean) : []
      };
      if (!post.title || !post.content) throw new LocalError(400, "A title and message are required.");
      updateShared((s) => s.posts.unshift(post));
      return post;
    }

    case "POST /posts/:id/like": {
      const me = requireUser();
      return updateShared((s) => {
        const post = findPost(s, id);
        if (post.likedBy.includes(me.id)) {
          post.likedBy = post.likedBy.filter((x) => x !== me.id);
          post.likes = Math.max(0, post.likes - 1);
        } else {
          post.likedBy.push(me.id);
          post.likes += 1;
        }
        return post;
      });
    }

    case "POST /posts/:id/replies": {
      const me = requireUser();
      const content = str(body?.content, 2000);
      if (!content) throw new LocalError(400, "Reply can't be empty.");
      return updateShared((s) => {
        const post = findPost(s, id);
        post.replies.push({ id: newId("rep"), authorId: me.id, authorName: me.name, authorRole: me.role, content, createdAt: new Date().toLocaleDateString("en-IN") });
        return post;
      });
    }
  }
  throw new LocalError(404, "Not found");
}
