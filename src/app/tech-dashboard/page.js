"use client";

import React, { useState, useEffect } from "react";
import AdminPanel from "../../../components/AdminPanel";

export default function TechDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if already authenticated in this session
  useEffect(() => {
    const isAuthed = sessionStorage.getItem("admin_authenticated");
    if (isAuthed === "true") {
      setIsAuthenticated(true);
    }
    setCheckingSession(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        sessionStorage.setItem("admin_authenticated", "true");
        setIsAuthenticated(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Authentication failed. Please try again.");
        // Shake screen or trigger brief alert
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Unable to verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (checkingSession) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", color: "var(--text-secondary)" }}>
        <div className="spinner" style={{ width: "32px", height: "32px" }}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="main-wrapper" style={{ paddingBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>Tech Console</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>Secure administrator access to manual synchronization and daemon tracking.</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Lock Console
          </button>
        </div>

        <AdminPanel onSyncComplete={() => console.log("[Tech Console] Sync completed.")} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "20px" }}>
      <div className="dashboard-card" style={{ maxWidth: "440px", width: "100%", padding: "32px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          {/* Glowing Lock Icon */}
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))",
            border: "1px solid var(--accent-primary)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
            animation: "pulse 2s infinite"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "6px" }}>Tech Console Locked</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Please enter your administrator credential password to access the AI Autopilot Dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter console password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-deep)",
                border: error ? "1.5px solid #ef4444" : "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "12px 42px 12px 16px",
                fontSize: "0.92rem",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = "var(--accent-primary)";
                  e.target.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.15)";
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = "var(--border-subtle)";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            {/* Show/Hide password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent-gradient)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontSize: "0.92rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              transition: "transform 0.15s ease, opacity 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            ) : (
              <span>Unlock Console</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
