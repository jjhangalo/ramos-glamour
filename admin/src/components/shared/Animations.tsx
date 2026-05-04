"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

// ─── Allowed polymorphic tags ──────────────────────────────────────────────────
// A closed union is needed to satisfy TypeScript without resorting to `any`.
type MotionTag =
  | "div"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "ul"
  | "ol"
  | "li"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "table"
  | "thead"
  | "tbody"
  | "tfoot"
  | "tr"
  | "td"
  | "th";

// ─── Shared hook ───────────────────────────────────────────────────────────────
// Returns true only after the first client render.
// This prevents Framer Motion from writing opacity:0 into SSR HTML,
// which causes content to be invisible on mobile until hydration completes.
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}

// ─── Variant definitions ───────────────────────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// ─── StaggerContainer ──────────────────────────────────────────────────────────
export function StaggerContainer({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: MotionTag;
}) {
  const mounted = useIsMounted();
  const Component = motion[as];

  return (
    <Component
      variants={staggerContainer}
      initial={mounted ? "hidden" : false}
      animate="show"
      className={className}
    >
      {children}
    </Component>
  );
}

// ─── StaggerItem ───────────────────────────────────────────────────────────────
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: MotionTag;
}) {
  const Component = motion[as];

  return (
    <Component variants={staggerItem} className={className}>
      {children}
    </Component>
  );
}

// ─── FadeUp ────────────────────────────────────────────────────────────────────
export function FadeUp({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: MotionTag;
}) {
  const mounted = useIsMounted();
  const Component = motion[as];

  return (
    <Component
      initial={mounted ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
