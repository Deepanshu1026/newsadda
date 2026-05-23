import React from "react";
import Link from "next/link";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import { getBreadcrumbSchema } from "../../../services/seo/schema";

export const metadata = {
  title: `Privacy Policy & Cookie Guidelines | ${SEO_CONFIG.siteName}`,
  description: `Learn how ${SEO_CONFIG.siteName} collects, stores, and protects user data and cookie configurations.`,
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/privacy-policy`
  }
};

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Privacy Policy", url: "/privacy-policy" }]);

  return (
    <div className="main-wrapper" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <JsonLd schema={breadcrumbSchema} />

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontSize: "0.9rem" }}>
        ← Back to Feed
      </Link>

      <article style={{ color: "var(--text-primary)", lineHeight: "1.7" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", letterSpacing: "-0.02em" }}>Privacy Policy</h1>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          At <strong>NewsAdda</strong>, we are committed to safeguarding the privacy of our readers and website visitors. This privacy statement details our data practices.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>1. Information We Collect</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          We collect standard analytics telemetry to audit page views, traffic patterns, and reader engagement metrics (such as views, session durations, and referral routes). This information is entirely aggregated, anonymous, and used strictly to improve Core Web Vitals and site layout speeds.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>2. Advertising & Google AdSense</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          We display standard Google AdSense and third-party advertisements on our platforms. These companies may use cookies to serve personalized advertisements based on your visits to this website and other platforms across the internet. These cookies do not track personal identifying information like your name, email, or telephone number.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>3. Cookies & Browser Controls</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
          You can choose to accept or decline cookies. Most web browsers automatically accept cookies by default, but you can usually modify your browser settings to decline cookies if you prefer. This will not affect your access to read any articles or features on NewsAdda.
        </p>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "32px", marginBottom: "12px" }}>4. Direct Contact</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          For any questions concerning data protections, cookie settings, or standard GDPR/CCPA auditing compliance, please email our support desk directly at <a href={`mailto:${SEO_CONFIG.publisher.email}`} style={{ color: "var(--accent-primary)" }}>{SEO_CONFIG.publisher.email}</a> or visit our <Link href="/contact" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Contact Us Page</Link> for contact channels and ownership details.
        </p>
      </article>
    </div>
  );
}
