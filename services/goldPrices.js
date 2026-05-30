const API_KEY = "d264911168e38edd26d76414a81c68a0";
const BASE_URL = "https://api.metalpriceapi.com/v1/latest";
const CURRENCIES = "EUR,INR,GBP,AED,CAD,AUD,JPY,CNY,XAU,XAG";

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

/** Fetch and normalize gold/silver prices (server-side safe) */
export async function fetchGoldPrices() {
  const url = `${BASE_URL}?api_key=${API_KEY}&base=USD&currencies=${CURRENCIES}`;

  const res = await fetch(url, { next: { revalidate: 300 } }); // 5 min ISR cache
  if (!res.ok) throw new Error(`MetalPriceAPI error: ${res.status}`);

  const data = await res.json();
  if (!data.success) throw new Error("MetalPriceAPI returned unsuccessful");

  const rates = data.rates || {};

  const usdPerOzGold = 1 / (rates.XAU || 1);
  const usdPerOzSilver = 1 / (rates.XAG || 1);

  const prices = {};
  Object.keys(GOLD_COUNTRY_CONFIG).forEach((code) => {
    const cfg = GOLD_COUNTRY_CONFIG[code];
    const fxRate = rates[cfg.currency] || 1;
    const goldPerUnit = (usdPerOzGold * fxRate) / cfg.unitFactor;
    const silverPerUnit = (usdPerOzSilver * fxRate) / cfg.unitFactor;

    prices[code] = {
      ...cfg,
      goldPrice: Math.round(goldPerUnit * 100) / 100,
      silverPrice: Math.round(silverPerUnit * 100) / 100,
      goldPriceUSD: Math.round(usdPerOzGold * 100) / 100,
      silverPriceUSD: Math.round(usdPerOzSilver * 100) / 100,
      lastUpdated: new Date(data.timestamp * 1000).toISOString(),
    };
  });

  return { prices, raw: data };
}
