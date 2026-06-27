"use client";

export default function PlanDetails({ subscription }: { subscription: any }) {
  const billingCycle = subscription?.billingCycle || "—";
  const amountPaid = subscription?.amountPaid || 0;

  return (
    <div className="dashboard-card p-6 rounded-2xl space-y-4">
      <h2 className="text-lg font-semibold">Plan Details</h2>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="dashboard-faint">Billing Cycle</p>
          <p className="font-medium capitalize">{billingCycle}</p>
        </div>

        <div>
          <p className="dashboard-faint">Amount</p>
          <p className="font-medium">₹{amountPaid.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
