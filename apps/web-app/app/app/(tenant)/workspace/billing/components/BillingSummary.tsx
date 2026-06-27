"use client";

export default function PaymentDetails({ subscription }: { subscription: any }) {
  const paymentId = subscription?.paymentId;
  const orderId = subscription?.orderId;

  return (
    <div className="dashboard-card p-5 rounded-2xl">
      <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

      {!paymentId ? (
        <p className="dashboard-muted text-sm">No payments recorded.</p>
      ) : (
        <div className="text-sm space-y-1">
          <p>
              <span className="dashboard-faint">Payment ID:</span>{" "}
            <span className="font-mono text-xs">{paymentId}</span>
          </p>

          {orderId && (
            <p>
              <span className="dashboard-faint">Order ID:</span>{" "}
              <span className="font-mono text-xs">{orderId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
