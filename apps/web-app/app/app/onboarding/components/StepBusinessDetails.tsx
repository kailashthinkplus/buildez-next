"use client";

import { useState, useEffect } from "react";
import { Briefcase, UserCircle } from "lucide-react";
import { useOnboarding } from "../OnboardingContext";

const COUNTRIES = [
  "United States","Canada","United Kingdom","Australia","New Zealand",
  "India","Singapore","United Arab Emirates","Germany","France",
  "Spain","Italy","Netherlands","Sweden","Norway","Denmark",
  "Finland","Brazil","Mexico","Argentina","South Africa",
  "Japan","South Korea","Philippines","Malaysia","Thailand","Vietnam",
];

const PROFESSIONS = [
  "Founder / CEO","Entrepreneur","Marketing Professional","Designer",
  "Software Developer","Consultant","Coach / Trainer","Freelancer",
  "Photographer","Architect","Doctor","Lawyer","Real Estate Agent",
  "Artist / Creator","Content Creator","Influencer","Digital Marketer",
  "Business Manager","Project Manager","Product Manager",
  "Operations Specialist",
];

const COMPANY_SIZES = [
  { value: "solo", label: "Just Me" },
  { value: "small_2_10", label: "2 – 10 People" },
  { value: "medium_11_50", label: "11 – 50 People" },
  { value: "large_50_plus", label: "50+ People" },
];

const USE_CASES = [
  { value: "company_website", label: "Company Website" },
  { value: "landing_pages", label: "Landing Pages" },
  { value: "marketing", label: "Marketing & Funnels" },
  { value: "internal_tools", label: "Internal Tools" },
  { value: "other", label: "Other" },
];

export default function StepBusinessDetails({ onNext, onBack }) {
  const { accountType } = useOnboarding();
  const isBusiness = accountType === "business";

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    country: "",
    profession: "",
    website: "",
    businessName: "",
    companySize: "",
    primaryUseCase: "",
  });

  // Fetch the user onboarding data when the component mounts
  useEffect(() => {
    async function fetchOnboardingData() {
      const res = await fetch("/api/onboarding/business-details");
      const data = await res.json();
      
      if (res.ok && data) {
        // Populate the form with the existing onboarding data
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          city: data.city || "",
          country: data.country || "",
          profession: data.profession || "",
          website: data.website || "",
          businessName: data.businessName || "",
          companySize: data.companySize || "",
          primaryUseCase: data.primaryUseCase || "",
        });
      }
    }

    fetchOnboardingData();
  }, []);

  const personalValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.city.trim() &&
    form.country.trim() &&
    form.profession.trim();

  const businessValid =
    personalValid &&
    form.businessName.trim() &&
    form.companySize &&
    form.primaryUseCase;

  const isValid = isBusiness ? businessValid : personalValid;

  async function submit() {
    if (!isValid) return;

    setLoading(true);

    const payload = {
      accountType,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      profession: form.profession.trim(),
      website: form.website || null,

      businessName: isBusiness
        ? form.businessName.trim()
        : `${form.firstName} ${form.lastName}`.trim(),

      companySize: isBusiness ? form.companySize : "solo",
      primaryUseCase: isBusiness ? form.primaryUseCase : "company_website",
    };

    let res;

    try {
      res = await fetch("/api/onboarding/business-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setLoading(false);
      return;
    }

    setLoading(false);

    if (!res.ok) return;

    onNext();
  }

  return (
    <div className="max-w-5xl mx-auto text-left">
      {/* TOP BADGE */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
          {isBusiness ? (
            <Briefcase className="text-blue-400" size={16} />
          ) : (
            <UserCircle className="text-blue-400" size={16} />
          )}
        </div>
        <p className="text-xs font-medium tracking-wide text-blue-400">
          {isBusiness ? "Business details" : "Profile details"}
        </p>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold leading-snug mb-3 text-slate-900 dark:text-white">
        {isBusiness ? "Tell us about your business" : "Tell us a bit about yourself"}
      </h2>

      {/* SUBTITLE */}
      <p className="text-sm text-slate-600 dark:text-white/65 max-w-3xl mb-10">
        {isBusiness
          ? "This helps us generate the right layout, copy, and structure for your business site."
          : "This helps us personalise layouts, tone, and content for your personal site."}
      </p>

      {/* BUSINESS NAME — only for business */}
      {isBusiness && (
        <div className="mb-6">
          <input
            className="glass p-4 rounded-xl text-sm w-full"
            placeholder="Business Name"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
        </div>
      )}

      {/* PERSONAL + SHARED FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <input
          className="glass p-4 rounded-xl text-sm"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />

        <input
          className="glass p-4 rounded-xl text-sm"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />

        <input
          className="glass p-4 rounded-xl text-sm"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <select
          className="glass p-4 rounded-xl text-sm bg-white/10 dark:bg-white/5"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* PROFESSION + WEBSITE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <select
          className="glass p-4 rounded-xl text-sm bg-white/10 dark:bg-white/5"
          value={form.profession}
          onChange={(e) => setForm({ ...form, profession: e.target.value })}
        >
          <option value="">Select primary profession</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          className="glass p-4 rounded-xl text-sm"
          placeholder="Website (Optional)"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      {/* BUSINESS EXTRA FIELDS */}
      {isBusiness && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <select
            className="glass p-4 rounded-xl text-sm w-full bg-white/10 dark:bg-white/5"
            value={form.companySize}
            onChange={(e) => setForm({ ...form, companySize: e.target.value })}
          >
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="glass p-4 rounded-xl text-sm w-full bg-white/10 dark:bg-white/5"
            value={form.primaryUseCase}
            onChange={(e) =>
              setForm({ ...form, primaryUseCase: e.target.value })
            }
          >
            <option value="">Select primary use case</option>
            {USE_CASES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-between">
        <button onClick={onBack} className="glass px-6 py-2.5 rounded-xl text-xs">
          ← Back
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={!isValid || loading}
          className={`
            px-6 py-2.5 rounded-xl text-xs font-medium transition text-white
            ${
              !isValid || loading
                ? "bg-blue-600/40 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }
          `}
        >
          {loading ? "Saving…" : "Next →"}
        </button>
      </div>
    </div>
  );
}
