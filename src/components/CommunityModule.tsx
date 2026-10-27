/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CommunityPost, Role } from "../types";
import { MessageSquare, ThumbsUp, SendHorizontal } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { staggerContainer, riseItem } from "./MotionKit";
import { DiscussIcon, PlusIcon } from "./icons";

interface CommunityModuleProps {
  posts: CommunityPost[];
  onAddPost: (post: CommunityPost) => void;
  onLikePost: (id: string) => void;
  onAddReply: (id: string, content: string) => void;
  currentUserId?: string;
}

// Posts: staggered on first paint; new ones drop in at the top while siblings reflow via `layout`
const postVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, transition: { duration: 0.18 } }
};

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition";
const labelClass = "block text-xs font-medium text-slate-600 mb-1.5";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors cursor-pointer";

const initials = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

// Role badge colours stay inside the brand palette
const roleStyle = (role: string) => {
  const r = String(role).toLowerCase();
  if (r.includes("admin")) return "bg-slate-100 text-slate-700";
  if (r.includes("buyer")) return "bg-harvest-50 text-harvest-600";
  if (r.includes("farmer")) return "bg-emerald-50 text-emerald-800";
  return "bg-slate-100 text-slate-600";
};

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-7 h-7 text-[11px]" : "w-10 h-10 text-sm";
  return (
    <div className={`${dims} rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center shrink-0 ring-2 ring-white`}>
      {initials(name)}
    </div>
  );
}

// Animated counter: the number rolls when it changes
function RollingCount({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function CommunityModule({ posts, onAddPost, onLikePost, onAddReply, currentUserId }: CommunityModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  // Per-post click counter, used only as an animation key to replay the like pop
  const [likeBursts, setLikeBursts] = useState<Record<string, number>>({});

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newPost: CommunityPost = {
      id: "post-" + Math.random().toString(36).substr(2, 9),
      authorId: "curr-farmer",
      authorName: "Ramesh Sen",
      authorRole: Role.FARMER,
      title,
      content,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toLocaleDateString(),
      tags: ["Soil", "Agronomy"]
    };

    onAddPost(newPost);
    setTitle("");
    setContent("");
    setShowAddForm(false);
  };

  const handleLike = (postId: string) => {
    // Pop only when adding a like, not when taking one back
    const alreadyLiked = !!currentUserId && !!posts.find((p) => p.id === postId)?.likedBy.includes(currentUserId);
    if (!alreadyLiked) setLikeBursts({ ...likeBursts, [postId]: (likeBursts[postId] || 0) + 1 });
    onLikePost(postId);
  };

  const handleSendReply = (postId: string) => {
    const rText = replyInput[postId];
    if (!rText) return;

    onAddReply(postId, rText);
    setReplyInput({
      ...replyInput,
      [postId]: ""
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <DiscussIcon className="w-6 h-6" animate />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Community</p>
            <h2 className="text-3xl text-slate-900 mt-0.5">Discussions</h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Ask questions, share what worked on your fields and learn from agronomists and other growers.
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
          {showAddForm ? "Cancel" : "New discussion"}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {showAddForm && (
          // Outer wrapper only animates height/margin so the page-open CSS animation and card hover lift stay untouched
          <motion.div
            key="new-topic-form"
            initial={{ height: 0, marginBottom: 0 }}
            animate={{ height: "auto", marginBottom: 32 }}
            exit={{ height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-900">Start a discussion</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Give enough detail about your crop, soil and region for others to help.</p>
                </div>
                <motion.form
                  onSubmit={handleAddPost}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  <motion.div variants={riseItem}>
                    <label className={labelClass}>Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Moisture dropping fast in sandy loam after sowing"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </motion.div>

                  <motion.div variants={riseItem}>
                    <label className={labelClass}>Details</label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Sowing yellow mustard after a soybean harvest. Which cover crops help hold moisture alongside it?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`${inputClass} resize-y`}
                      required
                    />
                  </motion.div>

                  <motion.div variants={riseItem} className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" className={primaryBtn}>Post discussion</button>
                  </motion.div>
                </motion.form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DiscussIcon className="w-7 h-7" animate />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No discussions yet</h3>
          <p className="mt-1 text-sm text-slate-500">Start the first one and ask the community a question.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
          <AnimatePresence>
            {posts.map((post) => {
              const liked = !!currentUserId && post.likedBy.includes(currentUserId);
              return (
                // Motion wrapper carries layout/entrance transforms; the inner card keeps the shared CSS hover lift
                <motion.div key={post.id} layout="position" variants={postVariants} exit="exit">
                  <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="p-6">
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <Avatar name={post.authorName} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{post.authorName}</span>
                            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${roleStyle(post.authorRole)}`}>
                              {post.authorRole}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{post.createdAt}</p>
                        </div>
                      </div>

                      {/* Title & body */}
                      <h3 className="mt-4 text-lg font-semibold text-slate-900 leading-snug">{post.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line max-w-prose">{post.content}</p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {post.tags.map((t) => (
                            <span key={t} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-1 -ml-2">
                        <motion.button
                          onClick={() => handleLike(post.id)}
                          whileTap={{ scale: 0.96 }}
                          aria-pressed={liked}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                            liked ? "text-emerald-800 bg-emerald-50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          <motion.span
                            key={likeBursts[post.id] || 0}
                            className="inline-flex"
                            initial={likeBursts[post.id] ? { scale: 1 } : false}
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <ThumbsUp className={`w-4 h-4 ${liked ? "fill-emerald-700/15" : ""}`} />
                          </motion.span>
                          <RollingCount value={post.likes} />
                          <span>{post.likes === 1 ? "like" : "likes"}</span>
                        </motion.button>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-500">
                          <MessageSquare className="w-4 h-4" />
                          <RollingCount value={post.replies.length} />
                          <span>{post.replies.length === 1 ? "reply" : "replies"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Replies */}
                    <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5 rounded-b-2xl">
                      {post.replies.length > 0 && (
                        <div className="ml-5 pl-5 border-l-2 border-slate-200 space-y-4 mb-5">
                          <AnimatePresence initial={false}>
                            {post.replies.map((rep) => (
                              // New replies unfold to their height, pushing the reply box down smoothly
                              <motion.div
                                key={rep.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className="flex gap-3">
                                  <Avatar name={rep.authorName} size="sm" />
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                      <span className="text-sm font-semibold text-slate-900">{rep.authorName}</span>
                                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${roleStyle(rep.authorRole)}`}>
                                        {rep.authorRole}
                                      </span>
                                      <span className="text-xs text-slate-400 tabular-nums">{rep.createdAt}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{rep.content}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Reply box */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a reply…"
                          aria-label={`Reply to ${post.title}`}
                          value={replyInput[post.id] || ""}
                          onChange={(e) => setReplyInput({ ...replyInput, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleSendReply(post.id)}
                          className={`${inputClass} flex-1`}
                        />
                        <motion.button
                          onClick={() => handleSendReply(post.id)}
                          whileTap={{ scale: 0.97 }}
                          disabled={!replyInput[post.id]}
                          className={`${primaryBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <SendHorizontal className="w-4 h-4" />
                          Reply
                        </motion.button>
                      </div>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
