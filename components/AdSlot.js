"use client";

import React, { useState, useEffect } from "react";

export default function AdSlot({ placement }) {
  const [visible, setVisible] = useState(true);
  const [floodColors, setFloodColors] = useState(["#3b82f6", "#ef4444", "#10b981", "#fbbf24"]);
  // Flood-It game state (4x4 grid representation)
  const [grid, setGrid] = useState([
    [0, 1, 2, 3],
    [3, 0, 1, 2],
    [2, 3, 0, 1],
    [1, 2, 3, 0],
  ]);
  const [moves, setMoves] = useState(0);

  if (!visible) return null;

  // Flood-It color click handler
  const handleFloodColorClick = (colorIndex) => {
    const targetColor = grid[0][0];
    if (targetColor === colorIndex) return;

    let newGrid = grid.map(row => [...row]);
    const flood = (r, c) => {
      if (r < 0 || r >= 4 || c < 0 || c >= 4) return;
      if (newGrid[r][c] !== targetColor) return;
      newGrid[r][c] = colorIndex;
      flood(r + 1, c);
      flood(r - 1, c);
      flood(r, c + 1);
      flood(r, c - 1);
    };

    flood(0, 0);
    setGrid(newGrid);
    setMoves(moves + 1);
  };

  // Google Test Ad Multi-color Capsule Logo SVG
  const AdManagerLogo = () => (
    <svg className="ad-manager-logo" width="100" height="30" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6H28V10H12V6Z" fill="#EA4335" />
      <path d="M6 14H34V18H6V14Z" fill="#4285F4" />
      <path d="M16 22H24V26H16V22Z" fill="#34A853" />
      <path d="M22 6H38V10H22V6Z" fill="#F9BC05" opacity="0.8" />
      <text x="44" y="20" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">TEST AD</text>
    </svg>
  );

  // Layout wrapper classes
  let containerClass = "ad-slot-wrapper ";
  if (placement === "left" || placement === "right") {
    containerClass += "sidebar-banner";
  } else if (placement === "bottom") {
    containerClass += "horizontal-banner";
  } else {
    containerClass += "inline-ad";
  }

  // Dismiss banner handler
  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <div className={containerClass}>
      {/* Background diagonal stripe effect representing official Google Test Ads */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #fff, #fff 10px, transparent 10px, transparent 20px)"
      }} />
      
      {/* Yellow Test Ad Badge */}
      <div className="ad-badge">Test Ad</div>

      {placement === "left" && (
        <div className="floodit-ad-card">
          <div className="floodit-title">Play Flood-It!</div>
          <div className="floodit-desc">Match all cells in {moves} moves</div>
          <div className="floodit-grid">
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="floodit-cell"
                  style={{ backgroundColor: floodColors[cell] }}
                />
              ))
            )}
          </div>
          <div className="floodit-controls">
            {floodColors.map((color, idx) => (
              <button
                key={idx}
                className="floodit-color-btn"
                style={{ backgroundColor: color }}
                onClick={() => handleFloodColorClick(idx)}
              />
            ))}
          </div>
          <button className="mascot-ad-btn" style={{ marginTop: "12px", background: "var(--accent-primary)" }} onClick={() => {
            setGrid([
              [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)],
              [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)],
              [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)],
              [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)],
            ]);
            setMoves(0);
          }}>Reset Game</button>
        </div>
      )}

      {placement === "right" && (
        <div className="mascot-ad-card">
          {/* Unicycling red monster mascot SVG */}
          <svg className="mascot-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Body */}
            <circle cx="50" cy="40" r="22" fill="#EF4444" />
            {/* Big Eye */}
            <circle cx="50" cy="34" r="9" fill="white" />
            <circle cx="50" cy="34" r="4" fill="#1E293B" />
            {/* Horns */}
            <path d="M36 24C34 16 42 18 42 18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <path d="M64 24C66 16 58 18 58 18" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            {/* Smile */}
            <path d="M44 48C44 48 47 52 50 52C53 52 56 48 56 48" stroke="white" strokeWidth="3" strokeLinecap="round" />
            {/* Unicycle */}
            <line x1="50" y1="62" x2="50" y2="76" stroke="#64748B" strokeWidth="4" />
            <circle cx="50" cy="80" r="10" stroke="#64748B" strokeWidth="3" fill="none" />
            {/* Mascot Pedals */}
            <line x1="45" y1="76" x2="55" y2="76" stroke="#334155" strokeWidth="2" />
          </svg>
          <div className="mascot-ad-title">Google AdMob</div>
          <div className="mascot-ad-desc">Monetize your mobile application using rich format test cards.</div>
          <button className="mascot-ad-btn" onClick={() => window.open("https://admob.google.com", "_blank")}>Get Started</button>
        </div>
      )}

      {placement === "bottom" && (
        <div className="ad-manager-logo-wrapper" style={{ flexDirection: "row", gap: "20px" }}>
          <AdManagerLogo />
          <div className="ad-manager-text" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Google AdSense • Earn revenue from your traffic out of the box
          </div>
          <button className="ad-close-btn" onClick={handleDismiss}>×</button>
        </div>
      )}

      {placement === "inline" && (
        <div className="ad-manager-logo-wrapper">
          <AdManagerLogo />
          <div className="ad-manager-text">Official Inline Mid-Article Test Placement</div>
          <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "4px" }}>
            Ad ID: ca-pub-3940259019942589/test-inline-300x250
          </div>
        </div>
      )}
    </div>
  );
}
