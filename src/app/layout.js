import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import SafeAdSlot from "../../components/seo/SafeAdSlot";
import StickyBottomAd from "../../components/StickyBottomAd";

export const metadata = {
  title: "NewsAdda — Trusted & Fast News",
  description:
    "Stay updated with real-time news, cricket, technology, politics, entertainment, and trending stories from India and around the world.",
  keywords:
    "tech news, trusted news, fast news, latest news, trending news, news blog, cricket, fashion, politics",
  openGraph: {
    title: "NewsAdda — Trusted & Fast News",
    description: "Real-time updates, trusted and fast news.",
    url: "https://newsadda.blog",
    siteName: "NewsAdda",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "NewsAdda Blog Feed",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  other: {
    "google-adsense-account": "ca-pub-8945078741780854",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Google AdSense Auto Ads */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8945078741780854"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Analytics (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CYFDN348Z4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-CYFDN348Z4');
          `}
        </Script>

        {/* Desktop Left Skyscraper Gutter Ad (Fixed viewport side rails) */}
        <div className="desktop-side-ad left-side-ad">
          <SafeAdSlot slotType="sidebar" />
        </div>

        {/* Desktop Right Skyscraper Gutter Ad (Fixed viewport side rails) */}
        <div className="desktop-side-ad right-side-ad">
          <SafeAdSlot slotType="sidebar" />
        </div>

        <div className="app-container">
          {/* Interactive Header Navigation */}
          <Navbar />

          {/* Core Content Viewport */}
          {children}

          {/* Shared Site Footer */}
          <footer className="footer">
            <div className="footer-content">
              <div className="logo-wrapper" style={{ cursor: "default", opacity: 0.75 }}>
                <Image
                  src="/logo.png"
                  alt="NewsAdda"
                  width={140}
                  height={32}
                  style={{
                    height: "32px",
                    width: "auto",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
              </div>
              <p style={{ maxWidth: "540px", color: "var(--text-muted)", lineHeight: 1.65 }}>
                NewsAdda is a highly-optimized news platform utilizing server-rendered
                Next.js for elite Google SEO indexation, providing fast and trusted updates.
              </p>
              <div className="footer-links" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", margin: "12px 0" }}>
                <Link href="/">Home Feed</Link>
                <Link href="/about">About Us</Link>
                <Link href="/contact">Contact Us</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms">Terms &amp; Conditions</Link>
                <Link href="/tech-dashboard">Tech Dashboard</Link>
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "8px" }}>
                © 2026 NewsAdda. All rights reserved. • Handled by <a href="https://github.com/Deepanshu1026" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", fontWeight: "600", textDecoration: "none" }}>Deepanshu Bisht</a>
              </p>
            </div>
          </footer>
        </div>

        {/* Floating Premium Sticky Bottom Display Ad */}
        <StickyBottomAd />
      </body>
    </html>
  );
}
