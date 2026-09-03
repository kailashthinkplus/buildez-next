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
}: {
  currency: string;
  currencies: readonly string[];
  onChange: (currency: string) => void;
  className?: string;
}) {
  return (
    <label className={`inline-flex items-center gap-2 text-xs font-medium ${className}`}>
      <span className="dashboard-muted">Currency</span>
      <select
        value={currency}
        onChange={(event) => onChange(event.target.value)}
        className="dashboard-card rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none"
      >
        {currencies.map((code) => (
          <option key={code} value={code}>{currencySymbol(code)} {code}</option>
        ))}
      </select>
    </label>
  );
}
