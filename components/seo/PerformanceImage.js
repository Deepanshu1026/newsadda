"use client";

import React, { useState } from "react";

/**
 * PerformanceImage React Component
 * Designed to completely eliminate Cumulative Layout Shift (CLS)
 * and optimize Largest Contentful Paint (LCP) for news hero assets.
 * 
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Image descriptive alt text
 * @param {string} [props.aspectRatio="16/9"] - Aspect ratio (e.g. "16/9", "4/3")
 * @param {string} [props.className] - CSS class name
 * @param {boolean} [props.priority=false] - If true, preloads image for LCP optimization
 * @param {string} [props.fallbackSrc] - Fallback placeholder if URL fails
 */
export default function PerformanceImage({
  src,
  alt,
  aspectRatio = "16/9",
  className = "",
  priority = false,
  fallbackSrc = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Convert aspect ratio (e.g. "16/9") to padding-bottom percentage for absolute positioning safety
  const [widthRatio, heightRatio] = aspectRatio.split("/").map(Number);
  const paddingBottom = widthRatio && heightRatio ? `${(heightRatio / widthRatio) * 100}%` : "56.25%";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: paddingBottom,
        backgroundColor: "var(--background-secondary, #f8fafc)",
        borderRadius: "12px",
        overflow: "hidden"
      }}
      className={`performance-image-container ${className}`}
    >
      <img
        src={imgSrc}
        alt={alt || "NewsAdda media coverage"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={priority ? "high" : "low"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.4s ease-in-out, opacity 0.3s ease",
          opacity: 1
        }}
        onError={handleError}
        className="performance-img"
      />
    </div>
  );
}
