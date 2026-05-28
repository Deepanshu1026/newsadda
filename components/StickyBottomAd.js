"use client";

import React, { useState, useEffect } from "react";

/**
 * StickyBottomAd Component
 * Renders a premium, dismissible, floating display ad docked at the bottom of the viewport.
 * 
 * - Production: Loads the verified ca-pub-8945078741780854 / 8787539742 Google AdSense footer slot.
 * - Development: Renders a premium test placeholder with manual force-live testing options.
 */
export default function StickyBottomAd() {
  const [visible, setVisible] = useState(false);
  const [isProduction, setIsProduction] = useState(false);
  const [forceLive, setForceLive] = useState(false);

  useEffect(() => {
    // Prevent SSR hydration mismatch by performing local storage & window environment checks after mount
    const isDismissed = sessionStorage.getItem("newsadda_sticky_ad_dismissed") === "true";
    if (isDismissed) {
      return;
    }

    const isProd = process.env.NODE_ENV === "production" || !window.location.hostname.includes("localhost");
    setIsProduction(isProd);

    const storedForceLive = localStorage.getItem("newsadda_force_live_ads") === "true";
    setForceLive(storedForceLive);

    setVisible(true);

    if (isProd || storedForceLive) {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.warn("[StickyBottomAd] AdSense push trigger failed:", e.message);
      }
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("newsadda_sticky_ad_dismissed", "true");
    setVisible(false);
  };

  const handleToggleForceLive = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !forceLive;
    localStorage.setItem("newsadda_force_live_ads", newValue ? "true" : "false");
    window.location.reload();
  };

  if (!visible) return null;

  const isReal = isProduction || forceLive;

  return (
    <div className="sticky-bottom-ad-container">
      <div className="sticky-bottom-ad-wrapper">
        {/* Ad Header (Sponsored & Actions) */}
        <div className="sticky-bottom-ad-header">
          <span className="sponsored-label">Sponsored Advertisement</span>
          
          <div className="sticky-bottom-ad-actions">
            {!isProduction && (
              <button 
                onClick={handleToggleForceLive}
                className="sandbox-toggle-btn"
                title={isReal ? "Switch to simulated placeholder" : "Load native Google AdSense container"}
              >
                {isReal ? "Show Sandbox" : "Show Real Ad"}
              </button>
            )}
            <button 
              onClick={handleDismiss} 
              className="sticky-bottom-ad-close"
              aria-label="Dismiss Advertisement"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ad Body */}
        <div className="sticky-bottom-ad-content">
          {isReal ? (
            <ins 
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-8945078741780854"
              data-ad-slot="8787539742"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="simulated-sticky-ad">
              {/* Ad Brand Info (Left) */}
              <div className="ad-brand">
                <div className="ad-brand-logo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="white" />
                  </svg>
                </div>
                <div className="ad-brand-info">
                  <span className="ad-brand-name">Google AdSense Partner</span>
                  <span className="ad-brand-desc">Earn revenue from your traffic out of the box</span>
                </div>
              </div>
              
              {/* Placement Details (Middle) */}
              <div className="ad-badge-preview">
                Test Placement (Sticky Footer)
              </div>
              
              {/* Action / ID Specs (Right) */}
              <div className="ad-cta">
                <span className="ad-meta-text">Slot: 8787539742</span>
                <a href="https://google.com/adsense" target="_blank" rel="noopener noreferrer" className="ad-cta-btn">
                  Learn More
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
