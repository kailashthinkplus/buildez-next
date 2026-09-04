"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type AccountType = "personal" | "business" | "agency" | null;

type BillingCycle = "monthly" | "yearly" | "forever";

export interface OnboardingContextType {
  step: number;
  setStep: (n: number) => void;

  accountType: AccountType;
  setAccountType: (v: AccountType) => void;

  businessName: string | null;
  setBusinessName: (v: string | null) => void;

  planId: string | null;
  setPlanId: (v: string | null) => void;

  billing: BillingCycle;
  setBilling: (v: BillingCycle) => void;

  domain: string | null;
  setDomain: (v: string | null) => void;

  phoneVerified: boolean;
  phoneVerificationRequired: boolean;

  completed: boolean;

  refreshFromServer: () => Promise<void>;

  /** UI guard to prevent skipping buttons */
  isStepValid: (n: number) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0);

  const [accountType, setAccountType] = useState<AccountType>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  const [planId, setPlanId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const [domain, setDomain] = useState<string | null>(null);

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationRequired, setPhoneVerificationRequired] = useState(false);

  const [completed, setCompleted] = useState(false);

  /* ----------------------------------------------------------------------
     STEP VALIDATION — prevents skipping from UI
  ---------------------------------------------------------------------- */
  const isStepValid = useCallback(
    (n: number) => {
      switch (n) {
        case 0:
          return true;

        case 1:
          return !!accountType;

        case 2:
          return !!accountType && !!businessName;

        case 3:
          if (planId === "trial") return true;
          return (
            !!accountType &&
            !!businessName &&
            !!planId &&
            !!billing // domain may still be null
          );

        case 4:
          if (planId === "trial") return !!businessName;
          return (
            !!accountType &&
            !!businessName &&
            !!planId &&
            !!billing &&
            (domain !== null) // domain required for paid plans
          );

        default:
          return false;
      }
    },
    [accountType, businessName, planId, billing, domain]
  );

  /* ----------------------------------------------------------------------
     REFRESH FROM SERVER — Single Source of Truth
  ---------------------------------------------------------------------- */
  async function refreshFromServer() {
    try {
      const res = await fetch("/api/onboarding/status", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      // hydrate
      setAccountType(
        ["personal", "business", "agency"].includes(data.accountType)
          ? data.accountType
          : null
      );

      setBusinessName(data.businessName ?? null);

      setPlanId(data.planCode ?? null);

      setBilling(
        ["monthly", "yearly", "forever"].includes(data.billingCycle)
          ? data.billingCycle
          : "monthly"
      );

      setDomain(data.domain ?? null);

      setPhoneVerified(Boolean(data.phoneVerified));
      setPhoneVerificationRequired(Boolean(data.phoneVerificationRequired));

      setCompleted(data.completed ?? false);

      /* ------------------------------------------------------------------
         Step calculation formula (server-authoritative)

         Mirrors /api/onboarding/status exactly:
         0 Account type
         1 Phone verification
         2 Business/profile details
         3 Choose plan
         4 Domain & launch (trial only)
         5 Finish

         Profile-completeness mirrors StepBusinessDetails' own
         validation — a business account already has `businessName`
         set at signup, so gating on businessName alone skipped
         StepBusinessDetails for every business account and left
         city/country/profession/companySize/primaryUseCase
         permanently unset.
      ------------------------------------------------------------------ */
      const hasPersonalFields = Boolean(
        data.firstName &&
        data.lastName &&
        data.city &&
        data.country &&
        data.profession
      );
      const profileComplete =
        data.accountType === "business"
          ? hasPersonalFields &&
            Boolean(data.businessName) &&
            Boolean(data.companySize) &&
            Boolean(data.primaryUseCase)
          : hasPersonalFields;

      if (!data.accountType) {
        setStep(0);
      } else if (!data.phoneVerified) {
        setStep(1);
      } else if (!profileComplete) {
        setStep(2);
      } else if (!data.planCode) {
        setStep(3);
      } else if (data.planCode !== "trial" && !data.domain) {
        setStep(4);
      } else {
        setStep(5);
      }
    } catch (err) {
      console.warn("⚠️ onboarding-status load failed", err);
    }
  }

  /* ----------------------------------------------------------------------
     INITIAL LOAD
  ---------------------------------------------------------------------- */
  useEffect(() => {
    // Try fetching data from localStorage if available
    const storedState = localStorage.getItem("onboarding-state");
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      setStep(parsedState.step);
      setAccountType(parsedState.accountType);
      setBusinessName(parsedState.businessName);
      setPlanId(parsedState.planId);
      setBilling(parsedState.billing);
      setDomain(parsedState.domain);
      setCompleted(parsedState.completed);
    }

    refreshFromServer();
  }, []);

  /* ----------------------------------------------------------------------
     LOCAL CACHED STATE (optional)
  ---------------------------------------------------------------------- */
  useEffect(() => {
    try {
      // Update the local storage whenever there's a change in state
      localStorage.setItem(
        "onboarding-state",
        JSON.stringify({
          step,
          accountType,
          businessName,
          planId,
          billing,
          domain,
          completed,
        })
      );
    } catch (err) {
      console.error("Error saving onboarding state to localStorage", err);
    }
  }, [step, accountType, businessName, planId, billing, domain, completed]);

  return (
    <OnboardingContext.Provider
      value={{
        step,
        setStep,
        accountType,
        setAccountType,
        businessName,
        setBusinessName,
        planId,
        setPlanId,
        billing,
        setBilling,
        domain,
        setDomain,
        phoneVerified,
        phoneVerificationRequired,
        completed,
        refreshFromServer,
        isStepValid,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside provider");
  return ctx;
}
