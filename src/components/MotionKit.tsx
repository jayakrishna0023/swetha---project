/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate, Variants } from "motion/react";

// Shared variants used by staggered lists across the app
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 24 } }
};

// Fades/rises its children into view the first time they scroll on screen
// `key` is listed because this project has no @types/react to supply it via IntrinsicAttributes
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string; key?: React.Key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated number that counts up from 0 when it enters the viewport
export function CountUp({ to, decimals = 0, prefix = "", suffix = "", duration = 1.6 }: { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = prefix + v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        }
      }
    });
    return () => controls.stop();
  }, [inView, to, decimals, prefix, suffix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// Card that tilts in 3D towards the cursor
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 18 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Button that is gently pulled towards the cursor
export function MagneticButton({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const x = useSpring(0, { stiffness: 300, damping: 15 });
  const y = useSpring(0, { stiffness: 300, damping: 15 });

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };

  return (
    <motion.button
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileTap={{ scale: 0.95 }}
      style={{ x, y }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Progress bar that fills from 0 to `value` percent once visible
export function AnimatedBar({ value, className = "bg-emerald-400", delay = 0 }: { value: number; className?: string; delay?: number }) {
  return (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full ${className}`}
      />
    </div>
  );
}
