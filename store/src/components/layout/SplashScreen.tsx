"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app";

export function SplashScreen() {
  const { isInitialLoading, setIsInitialLoading } = useAppStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Start internal animations after hydration
    const startTimeout = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Minimum display time for branding (2s)
    const minTimeTimeout = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    // 3. Signal that initial layout is ready after a small delay to allow hydration to settle
    const loadingTimeout = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400);

    // 4. Fail-safe: Force hide after 8 seconds in case of hydration/loading failure
    const failSafeTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(minTimeTimeout);
      clearTimeout(loadingTimeout);
      clearTimeout(failSafeTimeout);
    };
  }, [setIsInitialLoading]);

  useEffect(() => {
    // Only fade out when BOTH the app is ready and minimum time has passed
    if (!isInitialLoading && minTimeElapsed) {
      const hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000); // Duration of the fade out transition

      return () => clearTimeout(hideTimeout);
    }
  }, [isInitialLoading, minTimeElapsed]);

  if (!isVisible) return null;

  // Determining opacity: 
  // - Always 100 on server (isMounted is false)
  // - Stays 100 until (isInitialLoading is false AND minTimeElapsed is true)
  const isFadingOut = !isInitialLoading && minTimeElapsed;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000",
        isFadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div
          className={cn(
            "relative h-24 w-64 transform transition-all duration-1000 ease-out lg:h-32 lg:w-96",
            isAnimating ? "scale-100 opacity-100 translate-y-0" : "scale-110 opacity-0 translate-y-4"
          )}
        >
          <Image
            src="/logo-gold.png"
            alt="Ramos Glamour"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Decorative Line */}
        <div
          className={cn(
            "mt-8 h-[1px] bg-brand-gold transition-all duration-[1500ms] ease-in-out",
            isAnimating ? "w-32 lg:w-48 opacity-100" : "w-0 opacity-0"
          )}
        />

        {/* Tagline */}
        <p
          className={cn(
            "mt-6 text-[10px] font-light tracking-[0.5em] text-brand-gold/60 uppercase transition-all duration-1000 delay-500 ease-out",
            isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}
        >
          Elegância & Estilo
        </p>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transition-transform duration-[2000ms] ease-in-out",
            isAnimating ? "translate-x-[200%]" : "-translate-x-full"
          )}
        />
      </div>
    </div>
  );
}
