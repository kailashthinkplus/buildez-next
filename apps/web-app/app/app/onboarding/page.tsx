"use client";

import OnboardingCard from "./components/OnboardingCard";
import StepAccountType from "./components/StepAccountType";
import StepPhoneVerify from "./components/StepPhoneVerify";
import StepBusinessDetails from "./components/StepBusinessDetails";
import StepChoosePlan from "./components/StepChoosePlan";
import StepDomainLaunch from "./components/StepDomainLaunch";
import StepFinish from "./components/StepFinish";

import { useState } from "react";
import { useOnboarding } from "./OnboardingContext";

export default function OnboardingPage() {
  const { step, refreshFromServer, setStep, initializing, loadError, phoneVerificationRequired } = useOnboarding();

  // ⭐ NEW → Store payment success payload
  const [paymentSummary, setPaymentSummary] = useState<null | {
    plan: string;
    billingCycle: string;
    amount: number;
    subscriptionId?: string;
  }>(null);

  function goNext(target: number) {
    setStep(target);
  }

  function goBack(target: number) {
    setStep(target);
  }

  if (initializing) {
    return (
      <OnboardingCard>
        <div className="flex min-h-64 items-center justify-center text-sm text-slate-600 dark:text-white/65">
          Loading your progress…
        </div>
      </OnboardingCard>
    );
  }

  if (loadError) {
    return (
      <OnboardingCard>
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-red-500">{loadError}</p>
          <button type="button" onClick={() => void refreshFromServer()} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-500">
            Try again
          </button>
        </div>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard>
      {step === 0 && (
        <StepAccountType
          onNext={() => goNext(phoneVerificationRequired ? 1 : 2)}
        />
      )}

      {step === 1 && (
        <StepPhoneVerify
          onNext={() => goNext(2)}
          onBack={() => goBack(0)}
        />
      )}

      {step === 2 && (
        <StepBusinessDetails
          onNext={() => goNext(3)}
          onBack={() => goBack(phoneVerificationRequired ? 1 : 0)}
        />
      )}

      {step === 3 && (
        <StepChoosePlan
          // ⭐ UPDATED → accept success payload
          onNext={(data?: any) => {
            if (data?.success) {
              // Save payment info →
              setPaymentSummary({
                plan: data.plan,
                billingCycle: data.billingCycle,
                amount: data.amount,
                subscriptionId: data.subscriptionId,
              });
            }
            goNext(4);
          }}
          onBack={() => goBack(2)}
        />
      )}

      {step === 4 && (
        <StepDomainLaunch
          onNext={() => goNext(5)}
          onBack={() => goBack(3)}
        />
      )}

      {step === 5 && (
        <StepFinish
          paymentSummary={paymentSummary} // ⭐ NEW → pass to finish screen
          onBack={() => goBack(4)}
        />
      )}
    </OnboardingCard>
  );
}
