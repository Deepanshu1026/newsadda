const GOLD_API_KEY = "2b2e0c67d8e2f6fa6526a3b71cbcb773a3af790e24bd8dbb589a85f4a35b6fff";
const GOLD_API_BASE = "https://api.gold-api.com";
const FX_API_URL = "https://open.er-api.com/v6/latest/USD";

/** Country configs for gold/silver display (price per unit) */
export const GOLD_COUNTRY_CONFIG = {
  IN: { currency: "INR", name: "India", unit: "10g", unitFactor: 31.1035 / 10 },
  US: { currency: "USD", name: "USA", unit: "oz", unitFactor: 1 },
  AE: { currency: "AED", name: "UAE", unit: "g", unitFactor: 31.1035 },
  GB: { currency: "GBP", name: "UK", unit: "oz", unitFactor: 1 },
  CA: { currency: "CAD", name: "Canada", unit: "oz", unitFactor: 1 },
  AU: { currency: "AUD", name: "Australia", unit: "oz", unitFactor: 1 },
  JP: { currency: "JPY", name: "Japan", unit: "g", unitFactor: 31.1035 },
  CN: { currency: "CNY", name: "China", unit: "g", unitFactor: 31.1035 },
  EU: { currency: "EUR", name: "Europe", unit: "oz", unitFactor: 1 },
};

export const DEFAULT_COUNTRY = "IN";

/** Detect country from timezone / locale (client-safe) */
export function detectCountry() {
  if (typeof window === "undefined") return DEFAULT_COUNTRY;
  const lang = navigator.language || "en-US";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  const tzMap = {
    "Asia/Kolkata": "IN",
    "Asia/Calcutta": "IN",
    "America/New_York": "US",
    "America/Los_Angeles": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Phoenix": "US",
    "Europe/London": "GB",
    "Europe/Berlin": "EU",
    "Europe/Paris": "EU",
    "Europe/Madrid": "EU",
    "Europe/Rome": "EU",
    "Europe/Amsterdam": "EU",
    "Asia/Dubai": "AE",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Brisbane": "AU",
    "Asia/Tokyo": "JP",
    "Asia/Shanghai": "CN",
    "Asia/Hong_Kong": "CN",
    "Asia/Singapore": "CN",
  };

  if (tzMap[tz]) return tzMap[tz];

  const localeMap = {
    "en-IN": "IN",
    "hi-IN": "IN",
    "bn-IN": "IN",
    "te-IN": "IN",
    "mr-IN": "IN",
    "ta-IN": "IN",
    "gu-IN": "IN",
    "en-US": "US",
    "en-CA": "CA",
    "en-GB": "GB",
    "en-AU": "AU",
    "ja-JP": "JP",
    "zh-CN": "CN",
    "zh-HK": "CN",
    "ar-AE": "AE",
    "de-DE": "EU",
    "fr-FR": "EU",
    "es-ES": "EU",
    "it-IT": "EU",
  };

  if (localeMap[lang]) return localeMap[lang];
  if (lang.startsWith("en")) return "US";
  if (lang.startsWith("hi")) return "IN";
  if (lang.startsWith("ja")) return "JP";
  if (lang.startsWith("zh")) return "CN";
  if (lang.startsWith("ar")) return "AE";
  if (lang.startsWith("de") || lang.startsWith("fr") || lang.startsWith("es") || lang.startsWith("it"))
    return "EU";

  return DEFAULT_COUNTRY;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Calculate purity prices from pure 24K (99.9%) gold price */
function calculatePurityPrices(price24KPerUnit) {
  return {
    k24: round2(price24KPerUnit),
    k22: round2(price24KPerUnit * 0.916),   // 22K = 91.6% pure
    k18: round2(price24KPerUnit * 0.75),   // 18K = 75% pure
  };
}

/** Fetch and normalize gold/silver prices (server-side safe) */
export async function fetchGoldPrices() {
  // Parallel fetch: gold, silver, and exchange rates
  const [goldRes, silverRes, fxRes] = await Promise.all([
    fetch(`${GOLD_API_BASE}/price/XAU`, {
      headers: { "x-access-token": GOLD_API_KEY },
      next: { revalidate: 300 },
    }),
    fetch(`${GOLD_API_BASE}/price/XAG`, {
      headers: { "x-access-token": GOLD_API_KEY },
      next: { revalidate: 300 },
    }),
    fetch(FX_API_URL, { next: { revalidate: 300 } }),
  ]);

  if (!goldRes.ok) throw new Error(`Gold-API gold error: ${goldRes.status}`);
  if (!silverRes.ok) throw new Error(`Gold-API silver error: ${silverRes.status}`);
  if (!fxRes.ok) throw new Error(`Exchange rate API error: ${fxRes.status}`);

  const goldData = await goldRes.json();
  const silverData = await silverRes.json();
  const fxData = await fxRes.json();

  if (!goldData || typeof goldData.price !== "number") {
    throw new Error("Gold-API returned invalid gold data");
  }
  if (!silverData || typeof silverData.price !== "number") {
    throw new Error("Gold-API returned invalid silver data");
  }

  const usdPerOzGold = goldData.price;
  const usdPerOzSilver = silverData.price;
  const fxRates = fxData.rates || {};
  const lastUpdated = goldData.updatedAt || new Date().toISOString();

  const prices = {};
  Object.keys(GOLD_COUNTRY_CONFIG).forEach((code) => {
    const cfg = GOLD_COUNTRY_CONFIG[code];
    const fxRate = fxRates[cfg.currency] || 1;
    const goldPerUnit = (usdPerOzGold * fxRate) / cfg.unitFactor;
    const silverPerUnit = (usdPerOzSilver * fxRate) / cfg.unitFactor;

    prices[code] = {
      ...cfg,
      purity: calculatePurityPrices(goldPerUnit),
      silverPrice: round2(silverPerUnit),
      goldPrice: round2(goldPerUnit),     // 24K alias for backward compat
      goldPriceUSD: round2(usdPerOzGold),
      silverPriceUSD: round2(usdPerOzSilver),
      lastUpdated,
    };
  });

  return {
    prices,
    raw: { gold: goldData, silver: silverData, fx: fxData },
  };
}
