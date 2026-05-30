import { fetchGoldPrices, GOLD_COUNTRY_CONFIG, DEFAULT_COUNTRY } from "../../../services/goldPrices";
import { SEO_CONFIG } from "../../../services/seo/config";
import JsonLd from "../../../components/seo/JsonLd";
import Link from "next/link";

export const metadata = {
  title: "Gold Rate Today | Live Gold & Silver Prices (24K / 22K) — NewsAdda",
  description:
    "Check live gold price today and silver rate updates. Real-time 24K gold prices per gram and 10g in India, UAE, USA, UK and more. Updated every 5 minutes from global metal markets.",
  keywords: [
    "gold rate today",
    "gold price today",
    "silver price today",
    "24k gold rate",
    "22k gold price",
    "live gold price",
    "gold price per gram",
    "gold price per 10g",
    "gold rate india",
    "gold rate uae",
    "today gold rate",
    "today silver rate",
    " NewsAdda gold"
  ].join(", "),
  alternates: {
    canonical: `${SEO_CONFIG.baseUrl}/gold-rate`,
  },
  openGraph: {
    title: "Gold Rate Today | Live Gold & Silver Prices — NewsAdda",
    description: "Real-time gold and silver prices across India, UAE, USA, UK and more. Updated every 5 minutes.",
    url: `${SEO_CONFIG.baseUrl}/gold-rate`,
    siteName: "NewsAdda",
    images: [
      {
        url: `${SEO_CONFIG.baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Live Gold Rate Today",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const revalidate = 300; // ISR every 5 minutes

export default async function GoldRatePage() {
  let prices = null;
  let error = null;

  try {
    const data = await fetchGoldPrices();
    prices = data.prices;
  } catch (e) {
    error = e.message;
  }

  const lastUpdated = prices
    ? new Date(prices[DEFAULT_COUNTRY].lastUpdated).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const jsonLdDataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Live Gold and Silver Prices",
    description:
      "Real-time gold rate and silver price dataset covering India, UAE, USA, UK, Canada, Australia, Japan, China and Europe.",
    url: `${SEO_CONFIG.baseUrl}/gold-rate`,
    creator: {
      "@type": "Organization",
      name: "NewsAdda",
      url: SEO_CONFIG.baseUrl,
    },
    datePublished: new Date().toISOString(),
    license: "https://creativecommons.org/licenses/by-nc/4.0/",
    variableMeasured: ["Gold Price", "Silver Price"],
    spatialCoverage: {
      "@type": "Place",
      name: "Global",
    },
  };

  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the gold rate today in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: prices
            ? `As of today, the live 24K gold rate in India is approximately INR ${prices.IN.purity.k24.toLocaleString()} per 10 grams, 22K gold is around INR ${prices.IN.purity.k22.toLocaleString()} per 10 grams, and 18K gold is about INR ${prices.IN.purity.k18.toLocaleString()} per 10 grams. Silver is around INR ${prices.IN.silverPrice.toLocaleString()} per 10 grams. Prices refresh every 5 minutes.`
            : "Gold rates are updated in real-time. Visit our live ticker or refresh the page for the latest Indian gold price.",
        },
      },
      {
        "@type": "Question",
        name: "How often are NewsAdda gold prices updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NewsAdda gold and silver prices are refreshed every 5 minutes using global metal market data via MetalPriceAPI.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between 24K and 22K gold rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "24K gold is 99.9% pure and commands the highest price. 22K gold is 91.6% pure (mixed with alloys) and is commonly used for jewellery. The rates shown on NewsAdda reflect 24K pure gold benchmarks.",
        },
      },
      {
        "@type": "Question",
        name: "Which countries' gold rates are available on NewsAdda?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We provide live gold and silver rates for India, UAE, USA, UK, Canada, Australia, Japan, China and Europe.",
        },
      },
    ],
  };

  return (
    <main className="main-wrapper" style={{ paddingTop: "calc(var(--navbar-height) + 36px)" }}>
      <JsonLd schema={jsonLdDataset} />
      <JsonLd schema={jsonLdFAQ} />

      {/* Hero Header */}
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#b45309",
            marginBottom: "10px",
          }}
        >
          Live Market Data
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.6rem",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "var(--text-primary)",
            letterSpacing: "-1px",
            marginBottom: "12px",
          }}
        >
          Gold Rate Today
        </h1>
        <p
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            color: "var(--text-muted)",
            fontSize: "1rem",
            lineHeight: 1.65,
          }}
        >
          Real-time 24K gold and silver prices across major global markets. Data refreshes
          automatically every 5 minutes.
        </p>
        {lastUpdated && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "10px" }}>
            Last updated: {lastUpdated} IST
          </p>
        )}
      </header>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#991b1b",
            marginBottom: "28px",
            textAlign: "center",
          }}
        >
          Unable to load live prices right now. Please refresh shortly.
        </div>
      )}

      {/* Country Cards Grid */}
      {!error && prices && (
        <section>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 700,
              marginBottom: "20px",
              color: "var(--text-primary)",
            }}
          >
            Gold & Silver Prices by Region
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: "48px",
            }}
          >
            {Object.keys(GOLD_COUNTRY_CONFIG).map((code) => {
              const p = prices[code];
              if (!p) return null;
              const isIndia = code === "IN";
              return (
                <article
                  key={code}
                  style={{
                    background: isIndia
                      ? "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)"
                      : "var(--bg-card)",
                    border: isIndia
                      ? "1px solid rgba(217, 119, 6, 0.25)"
                      : "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "22px",
                    boxShadow: isIndia ? "0 8px 24px rgba(217,119,6,0.08)" : "var(--card-shadow)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {p.name}
                    </h3>
                    {isIndia && (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#92400e",
                          background: "#fef3c7",
                          padding: "4px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {isIndia && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "#fffbeb",
                            borderRadius: "10px",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            24K Gold (99.9%)
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: "1.05rem",
                              color: "#b45309",
                            }}
                          >
                            {p.currency} {p.purity.k24.toLocaleString()}
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                              {" "}
                              / {p.unit}
                            </span>
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "#fffbeb",
                            borderRadius: "10px",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            22K Gold (91.6%)
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: "1.05rem",
                              color: "#b45309",
                            }}
                          >
                            {p.currency} {p.purity.k22.toLocaleString()}
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                              {" "}
                              / {p.unit}
                            </span>
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "#fffbeb",
                            borderRadius: "10px",
                          }}
                        >
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            18K Gold (75%)
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: "1.05rem",
                              color: "#b45309",
                            }}
                          >
                            {p.currency} {p.purity.k18.toLocaleString()}
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                              {" "}
                              / {p.unit}
                            </span>
                          </span>
                        </div>
                      </>
                    )}

                    {!isIndia && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 12px",
                          background: "#f8fafc",
                          borderRadius: "10px",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                          24K Gold (99.9%)
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: "1.05rem",
                            color: "#b45309",
                          }}
                        >
                          {p.currency} {p.purity.k24.toLocaleString()}
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            {" "}
                            / {p.unit}
                          </span>
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: isIndia ? "#fffbeb" : "#f8fafc",
                        borderRadius: "10px",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                        Silver
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          color: "#475569",
                        }}
                      >
                        {p.currency} {p.silverPrice.toLocaleString()}
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                          {" "}
                          / {p.unit}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Global Benchmark Table */}
      {!error && prices && (
        <section style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 700,
              marginBottom: "20px",
              color: "var(--text-primary)",
            }}
          >
            Global Benchmark (USD per Troy Ounce)
          </h2>
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ textAlign: "left", padding: "14px 18px", fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Metal
                  </th>
                  <th style={{ textAlign: "right", padding: "14px 18px", fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    USD / troy oz
                  </th>
                  <th style={{ textAlign: "right", padding: "14px 18px", fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    Purity
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                    Gold (XAU)
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 800, color: "#b45309", fontSize: "1rem" }}>
                    $ {prices.US.goldPriceUSD.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    99.9%
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                    Silver (XAG)
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 800, color: "#475569", fontSize: "1rem" }}>
                    $ {prices.US.silverPriceUSD.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    99.9%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.35rem",
            fontWeight: 700,
            marginBottom: "20px",
            color: "var(--text-primary)",
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            {
              q: "What is the gold rate today in India?",
              a: prices
                ? `As of the latest update, the live 24K gold rate in India is approximately INR ${prices.IN.purity.k24.toLocaleString()} per 10 grams, 22K gold is around INR ${prices.IN.purity.k22.toLocaleString()} per 10 grams, 18K gold is about INR ${prices.IN.purity.k18.toLocaleString()} per 10 grams, and silver is around INR ${prices.IN.silverPrice.toLocaleString()} per 10 grams.`
                : "Our live ticker shows the current Indian gold rate. Please check the table above or the bottom ticker for the latest price.",
            },
            {
              q: "How often are NewsAdda gold prices updated?",
              a: "We refresh global gold and silver prices every 5 minutes using MetalPriceAPI market data.",
            },
            {
              q: "What is the difference between 24K and 22K gold?",
              a: "24K gold is 99.9% pure and used as an investment benchmark. 22K gold is 91.6% pure and is the standard for most jewellery in India.",
            },
            {
              q: "Why do gold rates differ by country?",
              a: "Gold prices vary due to import duties, local taxes (GST), currency exchange rates, transportation costs and regional demand-supply dynamics.",
            },
            {
              q: "Is the NewsAdda gold rate inclusive of GST?",
              a: "Our displayed rates are pure metal benchmarks before local taxes. Actual retail jewellery rates will include making charges and GST.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "14px 18px",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontWeight: 700,
                  fontSize: "0.97rem",
                  color: "var(--text-primary)",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {faq.q}
                <span style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>+</span>
              </summary>
              <p style={{ marginTop: "10px", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Back to News CTA */}
      <section style={{ textAlign: "center", padding: "32px 0" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--accent-primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.92rem",
            padding: "11px 22px",
            borderRadius: "10px",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(79,70,229,0.25)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to News Feed
        </Link>
      </section>
    </main>
  );
}
