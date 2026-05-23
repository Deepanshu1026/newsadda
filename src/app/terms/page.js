import React from "react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import { getBreadcrumbSchema } from "../../../services/seo/schema";

export const metadata = {
  title: `Terms & Conditions | ${SEO_CONFIG.siteName}`,
  description: `Read the official Terms of Service and Conditions governing the use of ${SEO_CONFIG.siteName}.`,
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/terms`
  }
};

export default function TermsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Terms & Conditions", url: "/terms" }]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <JsonLd schema={breadcrumbSchema} />

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontSize: "0.9rem" }}>
        ← Back to Feed
      </Link>

      <article style={{ color: "var(--text-primary)", lineHeight: "1.7" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.02em" }}>Terms &amp; Conditions</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Welcome to <strong>NewsAdda</strong>. By accessing or using this website, you agree to comply with and be bound by the following terms of use.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>1. Acceptance of Terms</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          The content, news reports, and information provided on this platform are for general informational purposes only. By reading, interacting, or scraping metadata, you warrant that you accept these terms in full. If you disagree with any part of these terms, you must not use this website.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>2. Intellectual Property Rights</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          Unless otherwise stated, NewsAdda and/or its licensors own the intellectual property rights for all material published on this site (including articles, layouts, programmatic descriptions, and performance structures). All intellectual property rights are reserved. You may view and print pages for personal use, but you must not republish, sell, rent, or redistribute our contents without explicit written consent.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>3. User Conduct &amp; Comments</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          You must not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the platform. You must not use the website to copy, store, host, transmit, send, use, publish or distribute any material which consists of (or is linked to) any spyware, computer virus, or malicious software.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>4. Disclaimers &amp; Limitations of Liability</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          While our editorial board strives to publish fully verified factual timelines, NewsAdda does not warrant the completeness, accuracy, or real-time precision of any dynamic ingestion. The website is provided "as is" without any representations or warranties, express or implied.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          For further inquiries regarding copyrights, licensing, or corporate partnerships, please contact our Legal desk directly through coordinates listed on our <Link href="/contact" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Contact Us Page</Link>.
        </p>
      </article>
    </div>
  );
}
