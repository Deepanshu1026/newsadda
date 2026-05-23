"use client";

import React, { useEffect, useState } from "react";

/**
 * SafeAdSlot React Component
 * Renders verified AdSense containers.
 * 
 * - Production: Renders native `<ins className="adsbygoogle">` tags. It starts completely 
 *   invisible (height: 0, no background/border) and only expands/shows when AdSense serves an ad.
 * - Development: Renders a dashed gray box so you can visually verify layouts.
 * 
 * @param {Object} props
 * @param {string} [props.slotType="leaderboard"] - Ad slot size preset ("leaderboard", "rectangle", "sidebar")
 * @param {string} [props.className] - CSS class name
 */
export default function SafeAdSlot({ slotType = "leaderboard", className = "" }) {
  // Manual ad slots are temporarily disabled for now since AdSense Auto Ads are fully active.
  // To re-enable manual placements in the future, simply comment out or delete the "return null;" statement below!
  return null;

  const [isProd, setIsProd] = useState(false);

  useEffect(() => {
    // Detect environment on mount to prevent SSR hydration mismatch
    setIsProd(process.env.NODE_ENV === "production");

    // Automatically trigger the AdSense script to search and load the ad unit
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.warn("[SafeAdSlot] AdSense push trigger failed:", error.message);
    }
  }, []);

  // Map standard advertising presets to fixed dimensions
  const layouts = {
    leaderboard: {
      width: "100%",
      minHeight: "90px",
      maxHeight: "120px",
      slotId: "8945078741780854" // Uses your verified publisher slot parameters
    },
    rectangle: {
      width: "300px",
      minHeight: "250px",
      maxHeight: "300px",
      slotId: "8945078741780854"
    },
    sidebar: {
      width: "120px",
      minHeight: "600px",
      maxHeight: "600px",
      slotId: "8945078741780854"
    }
  };

  const currentLayout = layouts[slotType] || layouts.leaderboard;

  // Production: Renders only the active Google AdSense tag.
  // It has no default borders, background, or text. It stays 100% invisible/hidden (height: 0) 
  // unless Google decides to serve an ad in it, in which case it automatically expands!
  if (isProd) {
    return (
      <div
        className={`adsense-prod-slot ${className}`}
        style={{
          margin: "24px auto",
          textAlign: "center",
          width: currentLayout.width,
          overflow: "hidden"
        }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: "auto"
          }}
          data-ad-client="ca-pub-8945078741780854"
          data-ad-slot={currentLayout.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Development: Shows dashed placeholder so you can visually verify layouts and slots!
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
        Advertisement Slot ({slotType})
      </span>

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
        Ad unit will load here dynamically in production. (Hidden if empty)
      </div>
    </div>
  );
}
