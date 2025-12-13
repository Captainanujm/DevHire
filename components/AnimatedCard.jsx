"use client";

import { motion } from "framer-motion";

export default function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
    >
      {children}
    </motion.div>
  );
}
