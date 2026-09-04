"use client";

function currencySymbol(code: string) {
  try {
    const part = new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "symbol" })
      .formatToParts(0)
      .find((piece) => piece.type === "currency");
    return part?.value || code;
  } catch {
    return code;
  }
}

export default function CurrencySwitcher({
  currency,
  currencies,
  onChange,
  className = "",
  symbolOnly = false,
  stacked = false,
}: {
  currency: string;
  currencies: readonly string[];
  onChange: (currency: string) => void;
  className?: string;
  symbolOnly?: boolean;
  /** Label above the dropdown instead of beside it. */
  stacked?: boolean;
}) {
  const showLabel = stacked || !symbolOnly;
  return (
    <label className={`${stacked ? "flex flex-col items-start gap-1.5" : "inline-flex items-center gap-2"} text-xs font-medium ${className}`}>
      <span className={showLabel ? "dashboard-muted" : "sr-only"}>Currency</span>
      <select
        aria-label="Display currency"
        value={currency}
        onChange={(event) => onChange(event.target.value)}
        className={`dashboard-card rounded-lg border-0 py-1.5 text-xs font-semibold outline-none ${symbolOnly ? "min-w-14 px-3 text-center" : "px-2.5"}`}
      >
        {currencies.map((code) => (
          <option key={code} value={code}>{symbolOnly ? currencySymbol(code) : `${currencySymbol(code)} ${code}`}</option>
        ))}
      </select>
    </label>
  );
}
