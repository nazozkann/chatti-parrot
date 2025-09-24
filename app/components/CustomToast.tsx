"use client";
import toast, { Toast } from "react-hot-toast";

type Variant = "success" | "error" | "info";

const variantBarClass: Record<Variant, string> = {
  success: "bg-[#22c55e]",
  error: "bg-[#ef4444]",
  info: "bg-accent",
};

export function showToast(message: string, variant: Variant = "info") {
  const bar = variantBarClass[variant];

  toast.custom((t: Toast) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } pointer-events-auto max-w-sm w-full rounded-lg shadow-lg bg-[var(--color-bg)] text-fg`}
    >
      <div className="flex">
        <div className={`w-1 rounded-l-lg ${bar}`} aria-hidden />
        <div className="flex-1 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">{message}</div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toast.remove(t.id)}
                className="px-2 text-lg py-1 rounded hover:opacity-80 text-[color:var(--color-muted)]"
                aria-label="Close Button"
                title="Close Button"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));
}
