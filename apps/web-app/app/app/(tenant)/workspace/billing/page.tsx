"use client";

import { useState, useEffect } from "react";
import BillingSummary from "./components/BillingSummary";
import PlanDetails from "./components/PlanDetails";
import PaymentDetails from "./components/PaymentDetails";
import UpgradePlanModal from "./components/UpgradePlanModal";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<any>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function load() {
    const res = await fetch("/api/tenant/me", { cache: "no-store" });
    const json = await res.json();
    setTenantData(json.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading || !tenantData) {
    return (
      <div className="flex items-center justify-center h-40 dashboard-muted">
        Loading…
      </div>
    );
  }

  const subscription = tenantData.plan;

  return (
    <>
      {/* Modal */}
      <UpgradePlanModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgraded={load}
      />

      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
            <p className="dashboard-muted text-sm">
              View your plan, subscription, and payment details.
            </p>
          </div>

          {/* UPGRADE BUTTON */}
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm"
          >
            Upgrade Plan →
          </button>
        </div>

        <BillingSummary subscription={subscription} />
        <PlanDetails subscription={subscription} />
        <PaymentDetails subscription={subscription} />
      </div>
    </>
  );
}
