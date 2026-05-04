"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a short delay
    const startTimeout = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Fade out after 2.5 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-1000",
        isAnimating ? "opacity-100" : "opacity-0",
        !isVisible && "pointer-events-none opacity-0"
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
