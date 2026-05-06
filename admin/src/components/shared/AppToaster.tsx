"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--brand-white)",
          color: "var(--brand-midnight)",
          borderRadius: "12px",
          border: "1px solid rgba(18, 18, 18, 0.05)",
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: "500",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        },
        success: {
          iconTheme: {
            primary: "var(--brand-olive)",
            secondary: "var(--brand-white)",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "var(--brand-white)",
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              <div className="flex-1 font-sans">{message}</div>
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-2 rounded-full p-1 text-brand-midnight/20 hover:bg-brand-midnight/5 hover:text-brand-midnight/60 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
