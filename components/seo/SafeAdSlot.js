"use client";

import React from "react";

/**
 * SafeAdSlot React Component
 * Designed to hold Google AdSense script components without causing CLS (Content Layout Shifts).
 * Pre-allocates spaces based on common standard advertising slot dimensions.
 * 
 * @param {Object} props
 * @param {string} [props.slotType="leaderboard"] - Ad slot size preset ("leaderboard", "rectangle", "sidebar")
 * @param {string} [props.className] - CSS class name
 */
export default function SafeAdSlot({ slotType = "leaderboard", className = "" }) {
  // Map standard advertising presets to fixed layouts
  const layouts = {
    leaderboard: {
      width: "100%",
      minHeight: "90px",
      maxHeight: "120px"
    },
    rectangle: {
      width: "300px",
      minHeight: "250px",
      maxHeight: "300px"
    },
    sidebar: {
      width: "100%",
      minHeight: "600px",
      maxHeight: "600px"
    }
  };

  const currentLayout = layouts[slotType] || layouts.leaderboard;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "24px auto",
        width: currentLayout.width,
        minHeight: currentLayout.minHeight,
        maxHeight: currentLayout.maxHeight,
        backgroundColor: "rgba(15, 23, 42, 0.02)",
        border: "1px dashed var(--border-subtle, rgba(15, 23, 42, 0.08))",
        borderRadius: "8px",
        overflow: "hidden"
      }}
      className={`adsense-safe-slot ${className}`}
    >
      <span
        style={{
          fontSize: "9px",
          fontWeight: "600",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--text-muted, #64748b)",
          marginBottom: "4px",
          marginTop: "4px"
        }}
      >
        Advertisement
      </span>
      
      {/* Visual Placeholder representing real AdSense container */}
      <div 
        style={{ 
          width: "100%", 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted, #94a3b8)"
        }}
      >
        Ad space reserved
      </div>
    </div>
  );
}
