"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FABProps = {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
  icon?: React.ElementType;
};

export const FAB = forwardRef<HTMLButtonElement | HTMLAnchorElement, FABProps>(
  ({ href, onClick, label, className, icon: Icon = Plus, ...props }, ref) => {
    const content = (
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-white shadow-inner transition-transform group-active:scale-90">
          <Icon className="h-6 w-6" />
        </div>
        {label && (
          <span className="pr-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            {label}
          </span>
        )}
      </div>
    );

    const baseStyles = cn(
      "fixed bottom-24 right-6 z-40 group flex h-14 items-center justify-center rounded-full bg-brand-midnight p-2 text-white shadow-[0_20px_50px_rgba(18,18,18,0.3)] transition-all hover:scale-105 active:scale-95 md:hidden",
      label ? "px-2" : "w-14",
      className
    );

    if (href) {
      return (
        <Link href={href} className={baseStyles} ref={ref as React.Ref<HTMLAnchorElement>} {...props}>
          {content}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onClick} className={baseStyles} ref={ref as React.Ref<HTMLButtonElement>} {...props}>
        {content}
      </button>
    );
  }
);
FAB.displayName = "FAB";
