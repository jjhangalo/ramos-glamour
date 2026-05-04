"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
} from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);

  if (!context) {
    throw new Error("Sheet components must be used inside <Sheet />.");
  }

  return context;
}

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

type SheetTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
};

export function SheetTrigger({ asChild = false, children }: SheetTriggerProps) {
  const { onOpenChange } = useSheetContext();

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        const originalProps = children.props as { onClick?: React.MouseEventHandler };
        originalProps.onClick?.(e);
        onOpenChange(true);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => {
        onOpenChange(true);
      }}
    >
      {children}
    </button>
  );
}

type SheetContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function SheetContent({ children, className }: SheetContentProps) {
  const { open, onOpenChange } = useSheetContext();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => {
          onOpenChange(false);
        }}
        className="absolute inset-0 bg-brand-charcoal/35 backdrop-blur-[2px] animate-in fade-in duration-300"
      />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-[0_20px_60px_rgba(98,98,96,0.18)] sm:p-8",
          "animate-in slide-in-from-right duration-300 ease-out",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
          }}
          className="absolute right-4 top-4 rounded-full border border-brand-charcoal/10 p-2 text-brand-charcoal transition hover:bg-brand-bg"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-6 space-y-2", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-3xl font-semibold text-brand-charcoal", className)}>{children}</h2>;
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm leading-6 text-brand-charcoal/70", className)}>{children}</p>;
}

export function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row", className)}>{children}</div>;
}
