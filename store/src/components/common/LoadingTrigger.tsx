"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app";

export function LoadingTrigger() {
  const { setIsInitialLoading } = useAppStore();

  useEffect(() => {
    setIsInitialLoading(false);
  }, [setIsInitialLoading]);

  return null;
}
