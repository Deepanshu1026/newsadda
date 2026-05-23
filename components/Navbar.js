"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();

  // Close drawer when clicking outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (!e.target.closest(".navbar") && !e.target.closest(".mobile-drawer")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [mobileOpen]);

  // Sync search to URL query so HomeFeed can pick it up
  const handleSearchChange = (value) => {
    setDesktopSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const handleMobileSearchChange = (value) => {
    setMobileSearch(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const navLinks = [
    { label: "Home", href: "/" },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-content">
          {/* Logo */}
          <Link href="/" className="logo-wrapper" id="nav-logo-link">
            <Image
              src="/logo.png"
              alt="NewsAdda"
              width={160}
              height={36}
              style={{
                height: "36px",
                width: "auto",
                objectFit: "contain",
                display: "block"
              }}
              priority
            />
          </Link>

          {/* Desktop centered nav links */}
          <nav className="nav-links" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link"
                id={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="navbar-search">
            <span className="navbar-search-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              id="navbar-search-desktop"
              type="search"
              className="navbar-search-input"
              placeholder="Search…"
              value={desktopSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search articles"
            />
          </div>

          {/* Mobile hamburger */}
          <button
            id="hamburger-menu-btn"
            className="hamburger-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              /* X icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        className={`mobile-drawer${mobileOpen ? " open" : ""}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Mobile search */}
        <div className="mobile-drawer-search">
          <span className="mobile-drawer-search-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            id="navbar-search-mobile"
            type="search"
            className="mobile-drawer-search-input"
            placeholder="Search articles…"
            value={mobileSearch}
            onChange={(e) => handleMobileSearchChange(e.target.value)}
            aria-label="Search articles"
          />
        </div>

        {/* Nav links */}
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="nav-link"
            id={`mobile-nav-link-${link.label.toLowerCase()}`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
