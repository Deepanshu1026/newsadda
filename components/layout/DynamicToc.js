"use client";

import React, { useEffect, useState } from "react";

/**
 * DynamicToc React Component
 * Scans article DOM content for heading tags (H2/H3), compiles an interactive index list,
 * and allows readers to smoothly jump to specific paragraphs.
 * 
 * Excellent for UX engagement and Google "Jump To" search result snippet indexing!
 * 
 * @param {Object} props
 * @param {string} props.selector - The CSS selector container of the article body (e.g. ".article-content")
 */
export default function DynamicToc({ selector = ".article-content" }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Wait for the server content to render and settle in DOM
    const timer = setTimeout(() => {
      const container = document.querySelector(selector);
      if (!container) return;

      const headingElements = Array.from(container.querySelectorAll("h2, h3"));

      const parsedHeadings = headingElements.map((el, index) => {
        // Set id if absent
        if (!el.id) {
          const textId = el.textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          el.id = `${textId}-${index}`;
        }

        return {
          id: el.id,
          text: el.textContent,
          level: el.tagName.toLowerCase() // "h2" or "h3"
        };
      });

      setHeadings(parsedHeadings);

      // Setup IntersectionObserver to highlight current active heading on scroll
      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, {
        rootMargin: "-80px 0px -60% 0px"
      });

      headingElements.forEach(el => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [selector]);

  if (headings.length === 0) return null;

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 85,
        behavior: "smooth"
      });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav
      style={{
        padding: "20px",
        backgroundColor: "var(--background-secondary, #f8fafc)",
        borderRadius: "16px",
        border: "1px solid var(--border-subtle, rgba(15, 23, 42, 0.06))",
        marginBottom: "28px"
      }}
      className="article-toc"
      aria-label="Table of contents"
    >
      <h3
        style={{
          fontSize: "0.85rem",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-primary, #0f172a)",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="21" y1="10" x2="3" y2="10" />
          <line x1="21" y1="6" x2="3" y2="6" />
          <line x1="21" y1="14" x2="3" y2="14" />
          <line x1="21" y1="18" x2="3" y2="18" />
        </svg>
        Table of Contents
      </h3>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        {headings.map((heading) => {
          const isH3 = heading.level === "h3";
          const isActive = heading.id === activeId;

          return (
            <li
              key={heading.id}
              style={{
                paddingLeft: isH3 ? "16px" : "0px",
                fontSize: "0.9rem"
              }}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleScroll(e, heading.id)}
                style={{
                  color: isActive ? "var(--accent-primary, #0f172a)" : "var(--text-muted, #475569)",
                  fontWeight: isActive ? "600" : "400",
                  textDecoration: "none",
                  transition: "color 0.2s ease, font-weight 0.2s ease",
                  display: "inline-block",
                  padding: "2px 0"
                }}
                className={`toc-link ${isActive ? "active" : ""}`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
