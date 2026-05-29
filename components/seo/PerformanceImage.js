"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * PerformanceImage React Component
 * Uses Next.js <Image> for automatic AVIF/WebP optimisation,
 * responsive sizing, and LCP prioritisation while keeping CLS zero
 * via an aspect-ratio container.
 *
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Image descriptive alt text
 * @param {string} [props.aspectRatio="16/9"] - Aspect ratio (e.g. "16/9", "4/3")
 * @param {string} [props.className] - CSS class name
 * @param {boolean} [props.priority=false] - If true, preloads image for LCP optimisation
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
      <Image
        src={imgSrc}
        alt={alt || "NewsAdda media coverage"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        quality={80}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
        style={{
          objectFit: "cover",
          transition: "transform 0.4s ease-in-out, opacity 0.3s ease"
        }}
        className="performance-img"
      />
    </div>
  );
}
