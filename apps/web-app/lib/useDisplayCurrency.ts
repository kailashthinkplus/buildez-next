"use client";

import { useEffect, useState } from "react";
import { SUPPORTED_CURRENCIES, isSupportedCurrency } from "@/lib/currency";

const STORAGE_KEY = "buildez-currency";

export const DISPLAY_CURRENCIES = ["INR", ...SUPPORTED_CURRENCIES.filter((code) => code !== "INR")];

function guessCountryFromLocale() {
  if (typeof navigator === "undefined") return null;
  const locale = navigator.languages?.[0] || navigator.language || "";
  const region = locale.split("-")[1];
  return region ? region.toUpperCase() : null;
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Detects the visitor's likely currency (IP geo, falling back to browser
 * locale) as a default, and lets them explicitly switch to any supported
 * currency, remembered across pages via localStorage. Purely a display
 * estimate — the actual charge currency/conversion is handled by Dodo
 * Payments' Adaptive Pricing at checkout.
 */
export function useDisplayCurrency() {
  const [currency, setCurrencyState] = useState("INR");
  const [rates, setRates] = useState<Partial<Record<string, number>>>({ INR: 1 });

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to detection.
    }
    if (isSupportedCurrency(stored)) {
      setCurrencyState(stored);
      return;
    }
    const controller = new AbortController();
    const country = guessCountryFromLocale();
    fetch(`/api/public/currency${country ? `?country=${encodeURIComponent(country)}` : ""}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        if (isSupportedCurrency(payload?.currency)) setCurrencyState(payload.currency);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/currency/rates", { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.rates) setRates(payload.rates);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function setCurrency(next: string) {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  function priceFor(amount: number, planCurrency: string) {
    if (currency === planCurrency) return formatPrice(amount, planCurrency);
    const rate = rates[currency];
    if (!rate) return formatPrice(amount, planCurrency);
    return formatPrice(Math.round(amount * rate), currency);
  }

  return {
    currency,
    setCurrency,
    availableCurrencies: DISPLAY_CURRENCIES,
    priceFor,
    formatPrice,
  };
}
