"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

// Wraps each route. Next.js remounts templates on navigation, so this gives a
// smooth enter transition every time you switch pages.
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
