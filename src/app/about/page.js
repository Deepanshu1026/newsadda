import React from "react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import { getOrganizationSchema } from "../../../services/seo/schema";

export const metadata = {
  title: `About Us | ${SEO_CONFIG.siteName}`,
  description: `Learn about the history, team, and editorial standards of ${SEO_CONFIG.siteName}. We deliver transparent and factual news across India.`,
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/about`
  }
};

export default function AboutPage() {
  const orgSchema = getOrganizationSchema();

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <JsonLd schema={orgSchema} />

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontSize: "0.9rem" }}>
        ← Back to Feed
      </Link>

      <article style={{ color: "var(--text-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.02em" }}>About NewsAdda</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.75", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Welcome to <strong>NewsAdda</strong>, a premier independent digital news platform committed to delivering prompt, accurate, and deeply context-driven reporting across India and globally.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>Our Mission</h2>
        <p style={{ lineHeight: "1.65", color: "var(--text-secondary)", marginBottom: "16px" }}>
          In an era filled with sensationalism and rapid information cycles, NewsAdda aims to stand as a beacon of factual journalism. We believe in presenting information exactly as it happens, enriched with background facts, legal timelines, and real-time news search details so our readers can make informed decisions.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>E-E-A-T and Transparency</h2>
        <p style={{ lineHeight: "1.65", color: "var(--text-secondary)", marginBottom: "16px" }}>
          We fully adhere to the highest guidelines of Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T). Every article published on our platform is generated or verified by our professional editorial board, referencing active source coordinates and live databases.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>Ownership & Operations</h2>
        <div style={{ backgroundColor: "var(--background-secondary, #f8fafc)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-subtle)", lineHeight: "1.6" }}>
          <strong>Platform:</strong> NewsAdda (Personal News & Tech Blog)<br />
          <strong>Handled By:</strong> <a href="https://github.com/Deepanshu1026" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "none" }}>Deepanshu Bisht</a><br />
          <strong>GitHub Profile:</strong> <a href="https://github.com/Deepanshu1026" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>https://github.com/Deepanshu1026</a>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>Operational Guidelines</h2>
        <p style={{ lineHeight: "1.65", color: "var(--text-secondary)" }}>
          To understand our core commitments to verification and correction practices, please read our dedicated <Link href="/editorial-policy" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Editorial & Fact-Checking Policies</Link> or get in touch directly on our <Link href="/contact" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Contact Us</Link> channel.
        </p>
      </article>
    </div>
  );
}
