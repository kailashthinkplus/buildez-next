"use client";

export default function PaymentDetails({ subscription }: { subscription: any }) {
  const paymentId = subscription?.paymentId;
  const orderId = subscription?.orderId;

  return (
    <div className="glass p-5 rounded-2xl border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

      {!paymentId ? (
        <p className="text-white/60 text-sm">No payments recorded.</p>
      ) : (
        <div className="text-sm space-y-1">
          <p>
            <span className="text-white/40">Payment ID:</span>{" "}
            <span className="font-mono text-xs">{paymentId}</span>
          </p>

          {orderId && (
            <p>
              <span className="text-white/40">Order ID:</span>{" "}
              <span className="font-mono text-xs">{orderId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
