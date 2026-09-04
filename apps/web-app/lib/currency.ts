export const SUPPORTED_CURRENCIES = [
  "AUD", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD",
  "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK",
  "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const SUPPORTED_SET = new Set<string>(SUPPORTED_CURRENCIES);

// ISO 3166-1 alpha-2 country -> ISO 4217 currency, for markets with a currency
// the exchange-rate provider (ECB via frankfurter.app) actually supports.
const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  IN: "INR",
  US: "USD", GB: "GBP",
  AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR", ES: "EUR", FI: "EUR",
  FR: "EUR", GR: "EUR", HR: "EUR", IE: "EUR", IT: "EUR", LT: "EUR", LU: "EUR",
  LV: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR",
  AU: "AUD", CA: "CAD", CH: "CHF", CN: "CNY", CZ: "CZK", DK: "DKK",
  HK: "HKD", HU: "HUF", ID: "IDR", IL: "ILS", IS: "ISK", JP: "JPY",
  KR: "KRW", MX: "MXN", MY: "MYR", NO: "NOK", NZ: "NZD", PH: "PHP",
  PL: "PLN", RO: "RON", SE: "SEK", SG: "SGD", TH: "THB", TR: "TRY",
  ZA: "ZAR", BR: "BRL",
};

export function currencyForCountry(country?: string | null): SupportedCurrency | null {
  if (!country) return null;
  return COUNTRY_TO_CURRENCY[country.trim().toUpperCase()] || null;
}

export function isSupportedCurrency(currency?: string | null): currency is SupportedCurrency {
  return Boolean(currency && SUPPORTED_SET.has(currency.toUpperCase()));
}

type RatesFromInr = Partial<Record<SupportedCurrency, number>>;

let cache: { data: RatesFromInr; expiresAt: number } | null = null;
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function getRatesFromInr(): Promise<RatesFromInr> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const targets = SUPPORTED_CURRENCIES.filter((code) => code !== "INR").join(",");
  const response = await fetch(`https://api.frankfurter.app/latest?from=INR&to=${targets}`, {
    next: { revalidate: TTL_MS / 1000 },
  });
  if (!response.ok) throw new Error("Exchange rate lookup failed");
  const payload = await response.json();
  const rates: RatesFromInr = { INR: 1, ...payload.rates };

  cache = { data: rates, expiresAt: Date.now() + TTL_MS };
  return rates;
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
