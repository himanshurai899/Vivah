"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const toaster = createToaster({
  placement: "bottom-end",
  gap: 12,
  overlap: true,
});

const CONFIG = {
  success: {
    icon: CheckCircle,
    border: "border-l-emerald-500",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    border: "border-l-red-500",
    iconColor: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-amber-400",
    iconColor: "text-amber-400",
  },
  info: {
    icon: Info,
    border: "border-l-violet-500",
    iconColor: "text-violet-400",
  },
} as const;

export function ArkToastRegion() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => {
          const cfg = CONFIG[(toast.type as keyof typeof CONFIG) ?? "info"] ?? CONFIG.info;
          const Icon = cfg.icon;
          return (
            <Toast.Root
              className={[
                "relative flex items-start gap-3 rounded-xl px-4 py-3 min-w-72 max-w-80",
                "border border-l-4",
                "shadow-xl",
                /* light */
                "bg-white border-[rgba(15,6,18,0.09)]",
                /* dark */
                "dark:bg-[#1E1230] dark:border-[rgba(201,168,76,0.15)]",
                cfg.border,
                /* motion */
                "transition-all duration-300 will-change-transform",
                "h-[--height] opacity-[--opacity]",
                "translate-x-[--x] translate-y-[--y]",
                "scale-[--scale] z-[--z-index]",
              ].join(" ")}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <Icon
                size={16}
                className={`shrink-0 mt-0.5 ${cfg.iconColor}`}
              />
              <div className="flex-1 min-w-0">
                <Toast.Title className="text-sm font-semibold text-[#0F0612] dark:text-[#F0EBF7] leading-snug">
                  {toast.title}
                </Toast.Title>
                {toast.description && (
                  <Toast.Description className="text-xs mt-0.5 text-[#5B4A6E] dark:text-[#B8A8D4] leading-relaxed">
                    {toast.description}
                  </Toast.Description>
                )}
              </div>
              <Toast.CloseTrigger
                type="button"
                className="shrink-0 p-0.5 rounded opacity-40 hover:opacity-80 transition-opacity text-[#0F0612] dark:text-[#F0EBF7]"
                aria-label="Dismiss"
              >
                <X size={13} />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </Portal>
  );
}
