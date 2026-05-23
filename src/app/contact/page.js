import React from "react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import { getBreadcrumbSchema } from "../../../services/seo/schema";

export const metadata = {
  title: `Contact the Editorial Desk | ${SEO_CONFIG.siteName}`,
  description: `Get in touch with the editorial team and journalists at ${SEO_CONFIG.siteName}. Submit feedback, tips, and corrections.`,
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/contact`
  }
};

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Contact", url: "/contact" }]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <JsonLd schema={breadcrumbSchema} />

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontSize: "0.9rem" }}>
        ← Back to Feed
      </Link>

      <article style={{ color: "var(--text-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.02em" }}>Contact Our Newsroom</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.75", color: "var(--text-secondary)", marginBottom: "24px" }}>
          We value transparent dialogue with our readers. If you have news tips, feedback, questions, or would like to submit a formal correction request, please use the direct channels below.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", margin: "32px 0" }}>
          <div style={{ border: "1px solid var(--border-subtle)", padding: "24px", borderRadius: "16px", backgroundColor: "var(--background-secondary, #f8fafc)" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>General Queries & Support</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", margin: 0 }}>
              Email: <a href="mailto:support@newsadda.com" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>support@newsadda.com</a>
            </p>
          </div>

          <div style={{ border: "1px solid var(--border-subtle)", padding: "24px", borderRadius: "16px", backgroundColor: "var(--background-secondary, #f8fafc)" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>Editorial & Press Invites</h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", margin: 0 }}>
              Email: <a href="mailto:editor@newsadda.com" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>editor@newsadda.com</a>
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>Editorial Corrections</h2>
        <p style={{ lineHeight: "1.65", color: "var(--text-secondary)", marginBottom: "16px" }}>
          NewsAdda is dedicated to absolute factual accuracy. If you spot a spelling error, an incorrect figure, or a factually incomplete assertion in any of our reports, please email our Editor-in-Chief at <a href="mailto:corrections@newsadda.com" style={{ color: "var(--accent-primary)" }}>corrections@newsadda.com</a>. Please include the specific URL link to the article and the details of the correction.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>Headquarters</h2>
        <p style={{ lineHeight: "1.65", color: "var(--text-secondary)", margin: 0 }}>
          {SEO_CONFIG.publisher.name}<br />
          {SEO_CONFIG.publisher.address.street},<br />
          {SEO_CONFIG.publisher.address.city}, {SEO_CONFIG.publisher.address.state} - {SEO_CONFIG.publisher.address.postalCode},<br />
          {SEO_CONFIG.publisher.address.country}
        </p>
      </article>
    </div>
  );
}
