export type CountryDialCode = { name: string; iso: string; dial: string };

/** Regional-indicator flag emoji derived from a 2-letter ISO code — no per-country emoji to maintain. */
export function flagEmoji(iso: string): string {
  return String.fromCodePoint(...iso.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)));
}

export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { name: "India", iso: "IN", dial: "+91" },
  { name: "United States", iso: "US", dial: "+1" },
  { name: "United Kingdom", iso: "GB", dial: "+44" },
  { name: "United Arab Emirates", iso: "AE", dial: "+971" },
  { name: "Australia", iso: "AU", dial: "+61" },
  { name: "Canada", iso: "CA", dial: "+1" },
  { name: "Singapore", iso: "SG", dial: "+65" },
  { name: "Germany", iso: "DE", dial: "+49" },
  { name: "France", iso: "FR", dial: "+33" },
  { name: "Netherlands", iso: "NL", dial: "+31" },
  { name: "Spain", iso: "ES", dial: "+34" },
  { name: "Italy", iso: "IT", dial: "+39" },
  { name: "Ireland", iso: "IE", dial: "+353" },
  { name: "Sweden", iso: "SE", dial: "+46" },
  { name: "Switzerland", iso: "CH", dial: "+41" },
  { name: "Saudi Arabia", iso: "SA", dial: "+966" },
  { name: "Qatar", iso: "QA", dial: "+974" },
  { name: "South Africa", iso: "ZA", dial: "+27" },
  { name: "Nigeria", iso: "NG", dial: "+234" },
  { name: "Kenya", iso: "KE", dial: "+254" },
  { name: "Egypt", iso: "EG", dial: "+20" },
  { name: "Brazil", iso: "BR", dial: "+55" },
  { name: "Mexico", iso: "MX", dial: "+52" },
  { name: "Japan", iso: "JP", dial: "+81" },
  { name: "South Korea", iso: "KR", dial: "+82" },
  { name: "China", iso: "CN", dial: "+86" },
  { name: "Hong Kong", iso: "HK", dial: "+852" },
  { name: "Malaysia", iso: "MY", dial: "+60" },
  { name: "Indonesia", iso: "ID", dial: "+62" },
  { name: "Philippines", iso: "PH", dial: "+63" },
  { name: "Thailand", iso: "TH", dial: "+66" },
  { name: "Vietnam", iso: "VN", dial: "+84" },
  { name: "Pakistan", iso: "PK", dial: "+92" },
  { name: "Bangladesh", iso: "BD", dial: "+880" },
  { name: "Sri Lanka", iso: "LK", dial: "+94" },
  { name: "Nepal", iso: "NP", dial: "+977" },
  { name: "New Zealand", iso: "NZ", dial: "+64" },
];

export const DEFAULT_COUNTRY_ISO = "IN";
