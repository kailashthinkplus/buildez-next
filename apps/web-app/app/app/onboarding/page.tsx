"use client";

import OnboardingCard from "./components/OnboardingCard";
import StepAccountType from "./components/StepAccountType";
import StepBusinessDetails from "./components/StepBusinessDetails";
import StepChoosePlan from "./components/StepChoosePlan";
import StepDomainLaunch from "./components/StepDomainLaunch";
import StepFinish from "./components/StepFinish";

import { useState } from "react";
import { useOnboarding } from "./OnboardingContext";

export default function OnboardingPage() {
  const { step, refreshFromServer, setStep } = useOnboarding();

  // ⭐ NEW → Store payment success payload
  const [paymentSummary, setPaymentSummary] = useState<null | {
    plan: string;
    billingCycle: string;
    amount: number;
    paymentId: string;
    orderId?: string;
  }>(null);

  // After each step completes, always reload server state
  async function goNext(target: number) {
    await refreshFromServer();
    setStep(target);
  }

  async function goBack(target: number) {
    await refreshFromServer();
    setStep(target);
  }

  return (
    <OnboardingCard>
      {step === 0 && (
        <StepAccountType
          onNext={() => goNext(1)}
        />
      )}

      {step === 1 && (
        <StepBusinessDetails
          onNext={() => goNext(2)}
          onBack={() => goBack(0)}
        />
      )}

      {step === 2 && (
        <StepChoosePlan
          // ⭐ UPDATED → accept success payload
          onNext={(data?: any) => {
            if (data?.success) {
              // Save payment info →
              setPaymentSummary({
                plan: data.plan,
                billingCycle: data.billingCycle,
                amount: data.amount,
                paymentId: data.paymentId,
                orderId: data.orderId,
              });
            }
            goNext(3);
          }}
          onBack={() => goBack(1)}
        />
      )}

      {step === 3 && (
        <StepDomainLaunch
          onNext={() => goNext(4)}
          onBack={() => goBack(2)}
        />
      )}

      {step === 4 && (
        <StepFinish
          paymentSummary={paymentSummary} // ⭐ NEW → pass to finish screen
          onBack={() => goBack(3)}
        />
      )}
    </OnboardingCard>
  );
}
