/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { User, Farm, Crop, Expense, MarketplaceItem, Equipment, CommunityPost, CropGrowthStage } from "./types";
import { usePersistentState } from "./usePersistentState";
import { seedFarms, seedCrops, seedExpenses } from "./seed";
import { api, setUnauthorizedHandler } from "./api";
import Auth from "./components/Auth";
import AccountModal from "./components/AccountModal";

// Import custom sub-modules
import LandingPage from "./components/LandingPage";
import DocsHubModule from "./components/DocsHubModule";
import FarmerModule from "./components/FarmerModule";
import CropModule from "./components/CropModule";
import AIRecommendations from "./components/AIRecommendations";
import DiseasePestModule from "./components/DiseasePestModule";
import WeatherMarketModule from "./components/WeatherMarketModule";
import FinancialModule from "./components/FinancialModule";
import MarketplaceModule from "./components/MarketplaceModule";
import CommunityModule from "./components/CommunityModule";
import ChatbotModule from "./components/ChatbotModule";
import LearningHubModule from "./components/LearningHubModule";
import CommandPalette from "./components/CommandPalette";
import NotificationCenter from "./components/NotificationCenter";
import { useToast } from "./components/Toaster";

import { Menu, X, Database, Loader2, Check, CloudOff } from "lucide-react";
import { LogoMark, DashboardIcon, PlotsIcon, CalendarIcon, LedgerIcon, WeatherIcon, AdvisorIcon, ScannerIcon, AssistantIcon, MarketIcon, DiscussIcon, LearnIcon, DocsIcon, SearchIcon, SettingsIcon, SignOutIcon } from "./components/icons";
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring } from "motion/react";

// Nav configurations
const menuItems = [
  { id: "landing", group: "Overview", label: "Dashboard", icon: <DashboardIcon className="w-[18px] h-[18px]" /> },
  { id: "farms", group: "My Farm", label: "Farm Plots", icon: <PlotsIcon className="w-[18px] h-[18px]" /> },
  { id: "crops", group: "My Farm", label: "Crop Calendar", icon: <CalendarIcon className="w-[18px] h-[18px]" /> },
  { id: "financial", group: "My Farm", label: "Expenses", icon: <LedgerIcon className="w-[18px] h-[18px]" /> },
  { id: "weather", group: "Insights", label: "Weather & Prices", icon: <WeatherIcon className="w-[18px] h-[18px]" /> },
  { id: "ai", group: "Insights", label: "Crop Advisor", icon: <AdvisorIcon className="w-[18px] h-[18px]" /> },
  { id: "disease", group: "Insights", label: "Disease Scanner", icon: <ScannerIcon className="w-[18px] h-[18px]" /> },
  { id: "chatbot", group: "Insights", label: "AI Assistant", icon: <AssistantIcon className="w-[18px] h-[18px]" /> },
  { id: "marketplace", group: "Community", label: "Marketplace", icon: <MarketIcon className="w-[18px] h-[18px]" /> },
  { id: "community", group: "Community", label: "Discussions", icon: <DiscussIcon className="w-[18px] h-[18px]" /> },
  { id: "academy", group: "Community", label: "Learning Hub", icon: <LearnIcon className="w-[18px] h-[18px]" /> },
  { id: "docs", group: "Project", label: "Documentation", icon: <DocsIcon className="w-[18px] h-[18px]" /> }
];

interface SharedData {
  marketplace: MarketplaceItem[];
  equipment: Equipment[];
  posts: CommunityPost[];
}

interface UserData {
  farms: Farm[];
  crops: Crop[];
  expenses: Expense[];
  readNotifications: string[];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

function Avatar({ user, size = "w-10 h-10 text-sm" }: { user: User; size?: string }) {
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${size} rounded-full object-cover border border-slate-200`} referrerPolicy="no-referrer" />
  ) : (
    <span className={`${size} rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-extrabold flex items-center justify-center shrink-0`}>
      {initials(user.name)}
    </span>
  );
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50 font-sans">
      <motion.div
        animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20"
      >
        <LogoMark className="w-7 h-7" mono animate />
      </motion.div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

// Auth gate: shows the sign-in screen until there is a session, then the workspace
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api<{ user: User | null }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return <FullScreenLoader label="Loading AgriSphere…" />;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {user ? (
          <motion.div key={`ws-${user.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Workspace user={user} onUserChange={setUser} onSignedOut={() => setUser(null)} />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Auth onAuthSuccess={setUser} />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

function Workspace({ user, onUserChange, onSignedOut }: { user: User; onUserChange: (u: User) => void; onSignedOut: () => void }) {
  const toast = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = usePersistentState<string>(`activeTab:${user.id}`, "landing");
  const [sidebarOpen, setSidebarOpen] = usePersistentState("sidebarOpen", true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiLive, setAiLive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setAiLive(!!d.aiLive))
      .catch(() => setAiLive(false));
  }, []);

  const [accountOpen, setAccountOpen] = useState(false);

  // Private farm records (saved to this user's account on the server)
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Shared community feeds
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");

  const loadAll = () => {
    setLoadError("");
    Promise.all([api<UserData>("/data"), api<SharedData>("/shared")])
      .then(([mine, community]) => {
        setFarms(mine.farms);
        setCrops(mine.crops);
        setExpenses(mine.expenses);
        setReadNotificationIds(mine.readNotifications);
        setMarketplaceItems(community.marketplace);
        setEquipmentList(community.equipment);
        setPosts(community.posts);
        setLoaded(true);
      })
      .catch((e) => setLoadError(e.message));
  };

  useEffect(loadAll, [user.id]);

  // Save private records shortly after any change
  const firstSave = useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(() => {
      api("/data", { method: "PUT", body: { farms, crops, expenses, readNotifications: readNotificationIds } })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 600);
    return () => clearTimeout(t);
  }, [loaded, farms, crops, expenses, readNotificationIds]);

  // Scroll progress of the main content pane
  const scrollRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const goTo = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // Ctrl/Cmd + K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Handlers
  const handleAddFarm = (farm: Farm) => {
    setFarms((prev) => [...prev, farm]);
    toast(`Registered "${farm.name}"`, "success");
  };

  const handleDeleteFarm = (id: string) => {
    setFarms((prev) => prev.filter((f) => f.id !== id));
    // clean up associated crops
    setCrops((prev) => prev.filter((c) => c.farmId !== id));
    toast("Farm plot and its crops removed", "info");
  };

  const handleAddCrop = (crop: Crop) => {
    setCrops((prev) => [...prev, crop]);
    toast(`Added ${crop.name} to the crop calendar`, "success");
  };

  const handleUpdateCropStage = (id: string, stage: CropGrowthStage) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === id ? { ...c, growthStage: stage } : c))
    );
    toast(`Stage updated to ${stage}`, "success");
  };

  const handleDeleteCrop = (id: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddExpense = (exp: Expense) => {
    setExpenses((prev) => [...prev, exp]);
    toast(`Logged ₹${exp.amount.toLocaleString("en-IN")} under ${exp.category}`, "success");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Shared feeds go through the server so every user sees the same listings and posts
  const replacePost = (post: CommunityPost) => setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
  const fail = (e: any) => toast(e.message || "Something went wrong. Please try again.", "warning");

  const handleAddMarketplaceItem = (item: MarketplaceItem) => {
    api<MarketplaceItem>("/marketplace", { method: "POST", body: item })
      .then((saved) => {
        setMarketplaceItems((prev) => [saved, ...prev]);
        toast("Listing published to the marketplace", "success");
      })
      .catch(fail);
  };

  const handleAddEquipment = (eq: Equipment) => {
    api<Equipment>("/equipment", { method: "POST", body: eq })
      .then((saved) => {
        setEquipmentList((prev) => [saved, ...prev]);
        toast(`${saved.name} listed for rent`, "success");
      })
      .catch(fail);
  };

  const handleBookEquipment = (id: string) => {
    api<Equipment>(`/equipment/${id}/book`, { method: "POST" })
      .then((saved) => {
        setEquipmentList((prev) => prev.map((eq) => (eq.id === id ? saved : eq)));
        toast("Reservation sent! The owner will call you to arrange delivery.", "success");
      })
      .catch(fail);
  };

  const handleAddPost = (post: CommunityPost) => {
    api<CommunityPost>("/posts", { method: "POST", body: post })
      .then((saved) => setPosts((prev) => [saved, ...prev]))
      .catch(fail);
  };

  const handleLikePost = (id: string) => {
    api<CommunityPost>(`/posts/${id}/like`, { method: "POST" }).then(replacePost).catch(fail);
  };

  const handleAddReply = (postId: string, content: string) => {
    api<CommunityPost>(`/posts/${postId}/replies`, { method: "POST", body: { content } }).then(replacePost).catch(fail);
  };

  const handleLoadSampleData = () => {
    if ((farms.length || crops.length || expenses.length) && !window.confirm("Replace your current farm records with sample data?")) return;
    setFarms(seedFarms.map((f) => ({ ...f, farmerId: user.id })));
    setCrops(seedCrops);
    setExpenses(seedExpenses);
    toast("Sample farm records loaded", "info");
  };

  const handleSignOut = () => {
    api("/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        setActiveTab("landing");
        onSignedOut();
      });
  };

  const activeLabel = menuItems.find((m) => m.id === activeTab)?.label ?? "";

  const navList = (expanded: boolean, layoutKey: string) => (
    <motion.nav
      className="space-y-1"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } } }}
    >
      {menuItems.map((item, idx) => {
        const active = activeTab === item.id;
        const startsGroup = idx === 0 || menuItems[idx - 1].group !== item.group;
        return (
          <React.Fragment key={item.id}>
          {startsGroup && (
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className={`px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/35 h-4 ${idx === 0 ? "" : "pt-5 h-9"}`}
            >
              {expanded ? item.group : <span className="block w-4 border-t border-white/10 mt-2" />}
            </motion.div>
          )}
          <motion.button
            key={item.id}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
            whileHover={{ x: active ? 0 : 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => goTo(item.id)}
            title={expanded ? undefined : item.label}
            className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
              active ? "text-white" : "text-emerald-100/60 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`nav-pill-${layoutKey}`}
                className="absolute inset-0 rounded-lg bg-white/[0.09] border border-white/[0.08]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            {active && (
              <motion.span
                layoutId={`nav-bar-${layoutKey}`}
                className="absolute -left-4 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-harvest-400"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <motion.span
              className={`relative shrink-0 ${active ? "text-white" : ""}`}
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              {item.icon}
            </motion.span>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="relative whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          </React.Fragment>
        );
      })}
    </motion.nav>
  );

  const logo = (expanded: boolean) => (
    <div className="flex items-center gap-2.5">
      <motion.div
        whileHover={{ rotate: -8, scale: 1.06 }}
        className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/10 text-white flex items-center justify-center shrink-0"
      >
        <LogoMark className="w-6 h-6" animate />
      </motion.div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="whitespace-nowrap">
            <span className="font-display font-semibold text-white tracking-tight block text-[17px] leading-none">AgriSphere</span>
            <span className="text-[10px] text-emerald-200/50 font-medium tracking-[0.14em] uppercase block mt-1">Farm management</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (loadError) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-slate-50 font-sans p-6 text-center">
        <CloudOff className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-semibold text-slate-700">{loadError}</p>
        <div className="flex gap-2">
          <button onClick={loadAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-4 py-2 rounded-xl cursor-pointer">Try again</button>
          <button onClick={handleSignOut} className="bg-white border border-slate-200 text-slate-600 font-bold text-sm px-4 py-2 rounded-xl cursor-pointer">Sign out</button>
        </div>
      </div>
    );
  }

  if (!loaded) return <FullScreenLoader label={`Loading ${user.name.split(" ")[0]}'s farm…`} />;

  return (
      <div className="h-dvh bg-slate-50 font-sans flex text-slate-800 overflow-hidden" style={{ ["--icon-accent" as string]: "#e0b13d" }}>
        {/* Sidebar navigation */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 68 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="bg-emerald-950 field-rows border-r border-emerald-900 shrink-0 flex-col justify-between z-30 hidden lg:flex overflow-hidden"
        >
          <div className="p-4 space-y-7 overflow-y-auto overflow-x-hidden [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
            {logo(sidebarOpen)}
            {navList(sidebarOpen, "desktop")}
          </div>

          {/* User profile section at bottom */}
          <AnimatePresence initial={false}>
            {user && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 border-t border-white/10 bg-black/10 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar user={user} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-harvest-400 ring-2 ring-emerald-950" />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <span className="font-semibold text-white text-[13px] block leading-tight truncate">{user.name}</span>
                    <span className="text-[11px] text-emerald-100/50 block truncate">{user.email}</span>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 60 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAccountOpen(true)}
                    className="p-1.5 rounded-lg text-emerald-100/60 hover:text-white hover:bg-white/10 cursor-pointer"
                    aria-label="Account settings"
                    title="Account settings"
                  >
                    <SettingsIcon className="w-4 h-4" mono />
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleLoadSampleData}
                    className="text-[11px] font-medium text-emerald-100/70 hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-white/15 hover:border-white/30 cursor-pointer transition-colors"
                    title="Fill your account with example plots, crops and expenses"
                  >
                    <Database className="w-3 h-3" />
                    Sample data
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="group text-[11px] font-medium text-emerald-100/70 hover:text-white flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/15 hover:border-rose-300/50 hover:bg-rose-500/15 cursor-pointer transition-colors"
                  >
                    <SignOutIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 w-[min(18rem,85vw)] bg-emerald-950 field-rows z-50 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] space-y-7 overflow-y-auto overscroll-contain shadow-2xl lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
              >
                <div className="flex items-center justify-between">
                  {logo(true)}
                  <button onClick={() => setMobileNavOpen(false)} className="p-1.5 rounded-lg text-emerald-100/70 hover:bg-white/10 cursor-pointer" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navList(true, "mobile")}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <button
                    onClick={() => {
                      setMobileNavOpen(false);
                      setAccountOpen(true);
                    }}
                    className="w-full flex items-center gap-3 text-left cursor-pointer"
                  >
                    <Avatar user={user} />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-white text-sm block truncate">{user.name}</span>
                      <span className="text-xs text-emerald-100/50 block truncate">{user.email}</span>
                    </span>
                    <SettingsIcon className="w-4 h-4 text-emerald-100/60" mono />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleLoadSampleData();
                      }}
                      className="text-xs font-medium text-emerald-100/80 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/15 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Sample data
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-medium text-emerald-100/80 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-white/15 cursor-pointer"
                    >
                      <SignOutIcon className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="relative bg-slate-50/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer hidden lg:block"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <motion.span className="block" animate={{ rotate: sidebarOpen ? 0 : 180 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              </motion.button>
              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-2 -ml-1 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Animated breadcrumb */}
              <div className="flex items-center gap-2 text-[13px] font-medium min-w-0">
                <span className="text-slate-400 hidden sm:inline">AgriSphere</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeLabel}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="text-slate-900 font-semibold truncate"
                  >
                    {activeLabel}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 text-[13px] text-slate-400 bg-white hover:border-slate-300 border border-slate-200 rounded-lg pl-2.5 pr-1.5 py-1.5 cursor-pointer shadow-sm lg:w-64"
              >
                <SearchIcon className="w-4 h-4" />
                <span className="hidden lg:inline flex-1 text-left">Searchâ€¦</span>
                <kbd className="hidden sm:inline font-mono text-[10px] text-slate-500 border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5">Ctrl K</kbd>
              </motion.button>

              <NotificationCenter
                crops={crops}
                expenses={expenses}
                readIds={readNotificationIds}
                onMarkRead={(ids) => setReadNotificationIds((prev) => Array.from(new Set([...prev, ...ids])))}
                onNavigate={goTo}
              />

              {aiLive !== null && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    toast(
                      aiLive
                        ? "AI features are live, powered by Groq."
                        : "AI features are in demo mode with sample answers. Add GROQ_API_KEY to .env locally, or to Vercel environment variables, to go live.",
                      aiLive ? "success" : "info"
                    )
                  }
                  className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                    aiLive ? "bg-white text-emerald-800 border-slate-200" : "bg-harvest-50 text-harvest-600 border-harvest-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${aiLive ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {aiLive ? "AI live" : "AI demo"}
                </motion.button>
              )}

              {/* Save status for private records */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={saveState}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`hidden lg:flex items-center gap-1 text-[11px] font-semibold ${saveState === "error" ? "text-rose-600" : "text-slate-400"}`}
                  title={saveState === "error" ? "Changes couldn't be saved. They'll retry on your next edit." : undefined}
                >
                  {saveState === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
                  {saveState === "saved" && <><Check className="w-3 h-3" /> Saved</>}
                  {saveState === "error" && <><CloudOff className="w-3 h-3" /> Not saved</>}
                </motion.span>
              </AnimatePresence>

              <button onClick={() => setAccountOpen(true)} className="lg:hidden cursor-pointer p-0.5" aria-label="Account settings">
                <Avatar user={user} size="w-8 h-8 text-xs" />
              </button>
              <button onClick={handleSignOut} className="lg:hidden hidden sm:block p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer" aria-label="Sign out">
                <SignOutIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Scroll progress */}
            <motion.div
              style={{ scaleX: progress }}
              className="absolute left-0 right-0 -bottom-px h-0.5 origin-left bg-gradient-to-r from-emerald-600 to-harvest-400"
            />
          </header>

          {/* Dynamic Tab Body */}
          <section ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={activeTab === "landing" ? "" : "stagger-in mx-auto w-full max-w-[1400px]"}
              >
                {activeTab === "landing" && (
                  <LandingPage
                    farms={farms}
                    crops={crops}
                    expenses={expenses}
                    onNavigate={goTo}
                  />
                )}

                {activeTab === "docs" && (
                  <DocsHubModule />
                )}

                {activeTab === "farms" && (
                  <FarmerModule
                    farms={farms}
                    onAddFarm={handleAddFarm}
                    onDeleteFarm={handleDeleteFarm}
                  />
                )}

                {activeTab === "crops" && (
                  <CropModule
                    farms={farms}
                    crops={crops}
                    onAddCrop={handleAddCrop}
                    onUpdateCropStage={handleUpdateCropStage}
                    onDeleteCrop={handleDeleteCrop}
                  />
                )}

                {activeTab === "ai" && (
                  <AIRecommendations />
                )}

                {activeTab === "disease" && (
                  <DiseasePestModule />
                )}

                {activeTab === "weather" && (
                  <WeatherMarketModule />
                )}

                {activeTab === "financial" && (
                  <FinancialModule
                    expenses={expenses}
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                  />
                )}

                {activeTab === "marketplace" && (
                  <MarketplaceModule
                    items={marketplaceItems}
                    equipmentList={equipmentList}
                    onAddItem={handleAddMarketplaceItem}
                    onAddEquipment={handleAddEquipment}
                    onBookEquipment={handleBookEquipment}
                  />
                )}

                {activeTab === "community" && (
                  <CommunityModule
                    posts={posts}
                    onAddPost={handleAddPost}
                    onLikePost={handleLikePost}
                    onAddReply={handleAddReply}
                    currentUserId={user.id}
                  />
                )}

                {activeTab === "chatbot" && (
                  <ChatbotModule />
                )}

                {activeTab === "academy" && (
                  <LearningHubModule />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </main>

        <CommandPalette
          open={paletteOpen}
          items={menuItems}
          onClose={() => setPaletteOpen(false)}
          onSelect={goTo}
        />

        <AccountModal open={accountOpen} user={user} onClose={() => setAccountOpen(false)} onUserUpdated={onUserChange} />
      </div>
  );
}
