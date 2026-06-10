"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getPostUrl } from "../lib/utils";
import PerformanceImage from "./seo/PerformanceImage";

export default function RightNewsRail({ posts = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Take posts for the slider (e.g. from index 6 to 11 to avoid featured posts overlay)
  const sliderPosts = posts.slice(6, 11);

  useEffect(() => {
    if (sliderPosts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % sliderPosts.length);
    }, 4000); // cycle every 4s

    return () => clearInterval(interval);
  }, [sliderPosts.length]);

  if (!posts || sliderPosts.length === 0) return null;

  return (
    <aside className="news-rail right-news-rail" aria-label="Hot topics panel">
      <div className="right-rail-title">Hot Topics</div>
      <div className="slider-container">
        {sliderPosts.map((post, index) => {
          const isActive = index === activeIdx;
          return (
            <div
              key={post.id}
              className={`slider-card${isActive ? " active" : ""}`}
            >
              <Link href={getPostUrl(post)} style={{ display: "block" }}>
                <div className="slider-img-wrap">
                  <PerformanceImage
                    src={post.image}
                    alt={post.title}
                    aspectRatio="16/10"
                  />
                </div>
                <div style={{ marginTop: "6px" }}>
                  <span className="slider-cat">{post.category || "News"}</span>
                </div>
                <h3 className="slider-title">{post.title}</h3>
              </Link>
            </div>
          );
        })}

        {/* Navigation Indicator Dots */}
        <div className="slider-dots">
          {sliderPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIdx(index)}
              className={`slider-dot${index === activeIdx ? " active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
