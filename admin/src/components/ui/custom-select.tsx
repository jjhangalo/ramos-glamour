"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  price?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccione uma opção...",
  emptyMessage = "Nenhuma opção encontrada.",
  className,
  disabled,
}: CustomSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-brand-midnight/10 bg-white px-4 py-3 text-sm transition-all focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:cursor-not-allowed disabled:bg-brand-bg/50",
            !selectedOption && "text-brand-midnight/40",
            className
          )}
        >
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 transition-transform duration-200 text-brand-midnight/30", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-1 border-brand-midnight/10 shadow-2xl rounded-xl overflow-hidden" 
        align="start"
      >
        <div className="max-h-60 overflow-y-auto no-scrollbar">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-brand-midnight/40 italic">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value === "" ? null : option.value);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-brand-bg/50 focus:bg-brand-bg/50",
                  value === option.value && "bg-brand-bg/80 text-brand-midnight font-bold"
                )}
              >
                <div className="flex flex-1 flex-col items-start gap-0.5">
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate">{option.label}</span>
                    {option.price && (
                      <span className="text-[10px] font-mono font-bold text-brand-midnight/40">
                        {option.price}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <span className="text-[10px] text-brand-midnight/40 font-normal">
                      {option.description}
                    </span>
                  )}
                </div>
                {value === option.value && (
                  <Check className="ml-2 h-3.5 w-3.5 text-brand-gold" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
