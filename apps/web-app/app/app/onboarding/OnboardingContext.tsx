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

  phone: string | null;
  phoneVerified: boolean;
  phoneVerificationRequired: boolean;
  phoneVerificationConfigured: boolean;

  completed: boolean;
  initializing: boolean;
  loadError: string | null;

  refreshFromServer: () => Promise<boolean>;

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

  const [phone, setPhone] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerificationRequired, setPhoneVerificationRequired] = useState(false);
  const [phoneVerificationConfigured, setPhoneVerificationConfigured] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
  const refreshFromServer = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/onboarding/status", {
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data.error || "We couldn't load your onboarding progress.");
        return false;
      }

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

      setPhone(data.phone ?? null);
      setPhoneVerified(Boolean(data.phoneVerified));
      setPhoneVerificationRequired(Boolean(data.phoneVerificationRequired));
      setPhoneVerificationConfigured(Boolean(data.phoneVerificationConfigured));

      setCompleted(data.completed ?? false);
      setStep(Number.isInteger(data.step) && data.step >= 0 && data.step <= 5 ? data.step : 0);
      return true;
    } catch (err) {
      console.warn("⚠️ onboarding-status load failed", err);
      setLoadError("We couldn't reach the production server. Check your connection and try again.");
      return false;
    } finally {
      setInitializing(false);
    }
  }, []);

  /* ----------------------------------------------------------------------
     INITIAL LOAD
  ---------------------------------------------------------------------- */
  useEffect(() => {
    localStorage.removeItem("onboarding-state");
    void refreshFromServer();
  }, [refreshFromServer]);

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
        phone,
        phoneVerified,
        phoneVerificationRequired,
        phoneVerificationConfigured,
        completed,
        initializing,
        loadError,
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
