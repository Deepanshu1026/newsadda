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
  const [isProd, setIsProd] = useState(false);
  const [forceLive, setForceLive] = useState(false);

  useEffect(() => {
    // Detect environment on mount to prevent SSR hydration mismatch
    const liveEnvironment =
      process.env.NODE_ENV === "production" ||
      (typeof window !== "undefined" && !window.location.hostname.includes("localhost"));
    setIsProd(liveEnvironment);

    if (typeof window !== "undefined") {
      setForceLive(localStorage.getItem("newsadda_force_live_ads") === "true");
    }

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
      slotId: "8787539742"
    },
    rectangle: {
      width: "300px",
      minHeight: "250px",
      maxHeight: "300px",
      slotId: "8787539742"
    },
    sidebar: {
      width: "120px",
      minHeight: "600px",
      maxHeight: "600px",
      slotId: "8787539742"
    }
  };

  const currentLayout = layouts[slotType] || layouts.leaderboard;
  const isReal = isProd || forceLive;

  // Production: Renders only the active Google AdSense tag.
  // It has no default borders, background, or text. It stays 100% invisible/hidden (height: 0) 
  // unless Google decides to serve an ad in it, in which case it automatically expands!
  if (isReal) {
    return (
      <div
        className={`adsense-prod-slot adsense-prod-slot--${slotType} ${className}`}
        style={{
          textAlign: "center",
          width: currentLayout.width,
          overflow: "hidden"
        }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%"
          }}
          data-ad-client="ca-pub-8945078741780854"
          data-ad-slot={currentLayout.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Development: Renders nothing to keep sandbox layouts clean of static ad boxes
  return null;
}
