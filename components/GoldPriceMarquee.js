"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { detectCountry, GOLD_COUNTRY_CONFIG } from "../services/goldPrices";

export default function GoldPriceMarquee() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("IN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Detect user country
    const cc = detectCountry();
    setCountry(cc);

    // Add body class for sticky ad offset
    if (typeof document !== "undefined") {
      document.body.classList.add("has-gold-marquee");
    }

    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/gold-prices", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (json.success && json.prices) {
          setData(json.prices);
        } else {
          throw new Error("Invalid response");
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 300000); // refresh every 5 min
    return () => {
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.body.classList.remove("has-gold-marquee");
      }
    };
  }, []);

  const cfg = GOLD_COUNTRY_CONFIG[country] || GOLD_COUNTRY_CONFIG["IN"];
  const local = data?.[country];

  // Build ticker segments for marquee loop
  const segments = [];
  if (data) {
    Object.keys(GOLD_COUNTRY_CONFIG).forEach((code) => {
      const p = data[code];
      if (!p) return;
      segments.push(
        `${p.name} Gold: ${p.currency} ${p.goldPrice.toLocaleString()} / ${p.unit}`
      );
      segments.push(
        `${p.name} Silver: ${p.currency} ${p.silverPrice.toLocaleString()} / ${p.unit}`
      );
    });
  }

  return (
    <div className="gold-marquee-bar" ref={containerRef}>
      <div className="gold-marquee-inner">
        {/* Left pill: live indicator + country */}
        <Link href="/gold-rate" className="gold-marquee-pill">
          <span className="gold-marquee-dot" aria-hidden="true" />
          <span className="gold-marquee-pill-text">
            {loading ? "Loading Rates…" : error ? "Gold Rates Unavailable" : `${cfg.name} Gold`}
          </span>
          {!loading && !error && local && (
            <span className="gold-marquee-pill-price">
              {local.currency} {local.goldPrice.toLocaleString()} <span className="gold-marquee-unit">/ {local.unit}</span>
            </span>
          )}
        </Link>

        {/* Scrolling ticker */}
        <div className="gold-marquee-track-wrapper">
          <div className="gold-marquee-track">
            {segments.length > 0 ? (
              <>
                {segments.map((text, i) => (
                  <span key={i} className="gold-marquee-item">
                    <span className="gold-marquee-icon" aria-hidden="true">◆</span>
                    {text}
                  </span>
                ))}
                {/* Duplicate for seamless loop */}
                {segments.map((text, i) => (
                  <span key={`dup-${i}`} className="gold-marquee-item">
                    <span className="gold-marquee-icon" aria-hidden="true">◆</span>
                    {text}
                  </span>
                ))}
              </>
            ) : (
              <span className="gold-marquee-item">Live Gold & Silver rates loading…</span>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <Link href="/gold-rate" className="gold-marquee-cta" aria-label="View full gold rate page">
          <span className="gold-marquee-cta-text">Full Rates</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
