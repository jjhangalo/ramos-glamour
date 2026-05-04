"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropdownMenuProps = {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
};

export function DropdownMenu({
  trigger,
  children,
  align = "right",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger ?? (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-midnight/10 text-brand-midnight/70 transition hover:bg-brand-bg bg-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute mt-2 w-48 origin-top-right rounded-2xl border border-brand-midnight/5 !bg-white p-1.5 shadow-2xl outline-none ring-1 ring-black/5 z-[100] !opacity-100",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div
            className="flex flex-col gap-1 !opacity-100"
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

type DropdownMenuItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-midnight/70 transition hover:bg-brand-bg hover:text-brand-midnight",
        className,
      )}
    >
      {children}
    </button>
  );
}
