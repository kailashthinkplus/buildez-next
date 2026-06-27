"use client";

export default function PaymentDetails({ subscription }: { subscription: any }) {
  const paymentId = subscription?.razorpayPaymentId;
  const orderId = subscription?.razorpayOrderId;
  const paidAt = subscription?.paidAt;

  const hasPayment = Boolean(paymentId || orderId);

  return (
    <div className="dashboard-card p-6 rounded-2xl space-y-4">
      <h2 className="text-lg font-semibold">Payment Details</h2>

      {!hasPayment && (
        <p className="text-sm dashboard-muted">No payments recorded.</p>
      )}

      {hasPayment && (
        <div className="grid grid-cols-2 gap-6 text-sm">
          {paymentId && (
            <div>
              <p className="dashboard-faint">Payment ID</p>
              <p className="font-mono text-xs">{paymentId}</p>
            </div>
          )}

          {orderId && (
            <div>
              <p className="dashboard-faint">Order ID</p>
              <p className="font-mono text-xs">{orderId}</p>
            </div>
          )}

          {paidAt && (
            <div>
              <p className="dashboard-faint">Paid At</p>
              <p>{new Date(paidAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
