import React from "react";

/**
 * SkeletonCard Component
 * Renders a shimmering layout skeleton of a news article card to stabilize layouts during fetch cycles.
 * Ensures Cumulative Layout Shift (CLS) stays at absolute 0.00.
 */
export default function SkeletonCard() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        border: "1px solid var(--border-subtle, rgba(15, 23, 42, 0.06))",
        borderRadius: "16px",
        backgroundColor: "var(--background-primary, #ffffff)",
        overflow: "hidden"
      }}
      className="skeleton-card animate-pulse"
    >
      {/* 16:9 Image Shimmer placeholder */}
      <div
        style={{
          width: "100%",
          paddingBottom: "56.25%", // 16:9 aspect box
          backgroundColor: "rgba(15, 23, 42, 0.05)",
          borderRadius: "12px"
        }}
      />
      
      {/* Meta row shimmer */}
      <div style={{ display: "flex", gap: "8px", width: "40%" }}>
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "4px", flex: 1 }} />
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "4px", width: "20px" }} />
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "4px", flex: 1 }} />
      </div>

      {/* Title shimmer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "90%" }}>
        <div style={{ height: "18px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "4px" }} />
        <div style={{ height: "18px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "4px", width: "60%" }} />
      </div>

      {/* Paragraph snippet shimmer */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", marginTop: "4px" }}>
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.04)", borderRadius: "4px" }} />
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.04)", borderRadius: "4px" }} />
        <div style={{ height: "12px", backgroundColor: "rgba(15, 23, 42, 0.04)", borderRadius: "4px", width: "80%" }} />
      </div>

      {/* Pill tags shimmer */}
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <div style={{ height: "24px", width: "80px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "12px" }} />
        <div style={{ height: "24px", width: "60px", backgroundColor: "rgba(15, 23, 42, 0.05)", borderRadius: "12px" }} />
      </div>
    </div>
  );
}
