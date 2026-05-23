import React from "react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import { getBreadcrumbSchema } from "../../../services/seo/schema";

export const metadata = {
  title: `Editorial Guidelines & Fact-Checking Policies | ${SEO_CONFIG.siteName}`,
  description: `Read the journalistic guidelines, fact-checking policies, and ethics standards governing all coverage on ${SEO_CONFIG.siteName}.`,
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/editorial-policy`
  }
};

export default function EditorialPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Editorial Policy", url: "/editorial-policy" }]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <JsonLd schema={breadcrumbSchema} />

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontSize: "0.9rem" }}>
        ← Back to Feed
      </Link>

      <article style={{ color: "var(--text-primary)", lineHeight: "1.7" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.02em" }}>Editorial Standards & Ethics</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          At <strong>NewsAdda</strong>, we hold our journalists and contributors to strict professional standards. Our primary objective is to deliver non-partisan, verified, and deeply contextualized news coverage.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>1. Fact-Checking & Verification</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          We double-check key facts, timelines, and assertions before publishing. Every dynamic news ingestion is contextualized with real-time news search details to verify statements and official releases. When reporting on complex social dynamics, legal procedures, or political events, we cross-reference multiple original sources, public archives, and primary coordinates to ensure absolute precision.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>2. Independence and Non-Partisanship</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          NewsAdda is privately funded and operated independently of any political party, corporate conglomerate, or interest group. Our editorial team exercises complete journalistic autonomy. We represent diverse viewpoints fairly, allowing our readers to formulate their own balanced conclusions based on raw facts and comprehensive analysis.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>3. E-E-A-T Author Guidelines</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          We verify our writers' expertise. Every article features a clear E-E-A-T verified profile of the contributing journalist. Profiles contain verified biography, social networks, and email coordinates, guaranteeing full accountability for every report published on our platforms.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>4. Corrections Policy</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          Despite our double-checks, mistakes can occur. We believe in correcting errors transparently and rapidly. If a correction is verified, we edit the text and add a prominent "Correction Note" at the top of the article detailing what was corrected and when.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          To submit a correction request, please review our direct newsroom contacts on our <Link href="/contact" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Contact Us Page</Link>.
        </p>
      </article>
    </div>
  );
}
