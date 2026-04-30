"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FABProps = {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
};

export function FAB({ href, onClick, label, className }: FABProps) {
  const content = (
    <>
      <Plus className="h-6 w-6 md:mr-2" />
      {label && (
        <span className="hidden text-sm font-bold uppercase tracking-wider md:block">
          {label}
        </span>
      )}
    </>
  );

  const baseStyles = cn(
    "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-all hover:bg-slate-800 active:scale-90 md:hidden",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseStyles}>
      {content}
    </button>
  );
}
