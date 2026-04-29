"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";
import { X } from "lucide-react";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "text-[10px] font-bold tracking-[0.2em] uppercase",
        style: {
          background: "#121212",
          color: "#FFFFFF",
          borderRadius: "0",
          padding: "16px 24px",
          border: "1px solid rgba(197, 160, 89, 0.3)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          maxWidth: "400px",
        },
        success: {
          iconTheme: {
            primary: "#C5A059",
            secondary: "#121212",
          },
        },
        error: {
          iconTheme: {
            primary: "#E8D5D0",
            secondary: "#121212",
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {icon}
                <div className="max-w-[280px] leading-relaxed">
                  {message}
                </div>
              </div>
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="group flex h-6 w-6 items-center justify-center transition-all hover:bg-brand-gold/10"
                  aria-label="Fechar"
                >
                  <X className="h-3 w-3 text-brand-white/40 transition-colors group-hover:text-brand-gold" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
