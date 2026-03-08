import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const NmProgressBar = ({ value = 0, max = 100, label, showPercent = true, height = 10 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium" style={{ color: "var(--nm-text-secondary)" }}>{label}</span>}
          {showPercent && <span className="text-xs font-semibold text-indigo-500">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="relative overflow-hidden"
        style={{
          height: `${height}px`,
          borderRadius: 999,
          background: "var(--nm-bg)",
          boxShadow: "inset 4px 4px 8px var(--nm-shadow), inset -4px -4px 8px var(--nm-highlight)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full"
          style={{
            borderRadius: 999,
            background: "linear-gradient(90deg, #6366f1, #a78bfa)",
            boxShadow: "0 0 8px rgba(99,102,241,0.5)",
          }}
        >
          {/* shimmer overlay */}
          <span
            className="absolute inset-0 animate-wave-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              borderRadius: 999,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default NmProgressBar;
