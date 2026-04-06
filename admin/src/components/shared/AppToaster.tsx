"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "text-sm",
        duration: 3500,
      }}
    />
  );
}
