"use client";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose(): void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`fixed bottom-5 right-5 z-[110000] flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-white shadow-2xl ${
        type === "success"
          ? "border-emerald-400/30 bg-emerald-950"
          : "border-red-400/30 bg-red-950"
      }`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
