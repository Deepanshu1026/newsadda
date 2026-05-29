"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * PerformanceImage React Component
 * Keeps CLS zero via an aspect-ratio container.
 * Uses Next.js <Image> for whitelisted domains (Unsplash) and
 * a plain <img> for external news images so unpredictable domains
 * never get blocked.
 *
 * @param {Object} props
 * @param {string} props.src - Image URL
 * @param {string} props.alt - Image descriptive alt text
 * @param {string} [props.aspectRatio="16/9"] - Aspect ratio (e.g. "16/9", "4/3")
 * @param {string} [props.className] - CSS class name
 * @param {boolean} [props.priority=false] - If true, preloads image for LCP optimisation
 * @param {string} [props.fallbackSrc] - Fallback placeholder if URL fails
 */

const NEXTJS_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "unsplash.com"
]);

function isNextJsOptimizable(url) {
  try {
    const { hostname } = new URL(url);
    return NEXTJS_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

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

  const [widthRatio, heightRatio] = aspectRatio.split("/").map(Number);
  const paddingBottom = widthRatio && heightRatio ? `${(heightRatio / widthRatio) * 100}%` : "56.25%";

  const useNextImage = isNextJsOptimizable(imgSrc);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

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
      {useNextImage ? (
        <Image
          src={imgSrc}
          alt={alt || "NewsAdda media coverage"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          quality={80}
          onError={handleError}
          style={{
            objectFit: "cover",
            transition: "transform 0.4s ease-in-out, opacity 0.3s ease"
          }}
          className="performance-img"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt || "NewsAdda media coverage"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
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
      )}
    </div>
  );
}
