"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { detectCountry, GOLD_COUNTRY_CONFIG } from "../services/goldPrices";

export default function GoldPriceMarquee() {
  const [data, setData] = useState(null);
  const [country, setCountry] = useState("IN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cc = detectCountry();
    setCountry(cc);

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
  const isIndia = country === "IN";

  // Build content based on country
  const renderRates = () => {
    if (loading) {
      return (
        <span className="gold-marquee-loading">
          <span className="gold-marquee-dot" aria-hidden="true" />
          Loading Live Rates…
        </span>
      );
    }

    if (error || !local) {
      return (
        <span className="gold-marquee-loading">
          <span className="gold-marquee-dot gold-marquee-dot--off" aria-hidden="true" />
          Live Gold Rates Unavailable
        </span>
      );
    }

    if (isIndia) {
      // India: show 24K, 22K, 18K + Silver
      return (
        <div className="gold-marquee-rates">
          <span className="gold-marquee-country">{cfg.name}</span>
          <span className="gold-marquee-rate-item">
            <span className="gold-marquee-karat">24K</span>
            <span className="gold-marquee-amount">₹ {local.purity.k24.toLocaleString()}</span>
            <span className="gold-marquee-unit">/ {cfg.unit}</span>
          </span>
          <span className="gold-marquee-rate-item">
            <span className="gold-marquee-karat">22K</span>
            <span className="gold-marquee-amount">₹ {local.purity.k22.toLocaleString()}</span>
            <span className="gold-marquee-unit">/ {cfg.unit}</span>
          </span>
          <span className="gold-marquee-rate-item">
            <span className="gold-marquee-karat">18K</span>
            <span className="gold-marquee-amount">₹ {local.purity.k18.toLocaleString()}</span>
            <span className="gold-marquee-unit">/ {cfg.unit}</span>
          </span>
          <span className="gold-marquee-rate-item gold-marquee-rate-item--silver">
            <span className="gold-marquee-karat">Silver</span>
            <span className="gold-marquee-amount">₹ {local.silverPrice.toLocaleString()}</span>
            <span className="gold-marquee-unit">/ {cfg.unit}</span>
          </span>
          <span className="gold-marquee-live">
            <span className="gold-marquee-dot" aria-hidden="true" />
            Live
          </span>
        </div>
      );
    }

    // Other countries: show 24K Gold + Silver only
    return (
      <div className="gold-marquee-rates">
        <span className="gold-marquee-country">{cfg.name}</span>
        <span className="gold-marquee-rate-item">
          <span className="gold-marquee-karat">24K Gold</span>
          <span className="gold-marquee-amount">
            {local.currency} {local.purity.k24.toLocaleString()}
          </span>
          <span className="gold-marquee-unit">/ {cfg.unit}</span>
        </span>
        <span className="gold-marquee-rate-item gold-marquee-rate-item--silver">
          <span className="gold-marquee-karat">Silver</span>
          <span className="gold-marquee-amount">
            {local.currency} {local.silverPrice.toLocaleString()}
          </span>
          <span className="gold-marquee-unit">/ {cfg.unit}</span>
        </span>
        <span className="gold-marquee-live">
          <span className="gold-marquee-dot" aria-hidden="true" />
          Live
        </span>
      </div>
    );
  };

  return (
    <div className="gold-marquee-bar">
      <div className="gold-marquee-inner">
        {renderRates()}

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
