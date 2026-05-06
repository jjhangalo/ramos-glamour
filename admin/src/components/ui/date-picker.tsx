"use client";

import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | null;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ date, setDate, placeholder = "Seleccionar data", disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-12 rounded-xl border-brand-midnight/10 px-4 normal-case tracking-normal",
            !date && "text-brand-midnight/40"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {date ? format(date, "PPP", { locale: pt }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={setDate}
          autoFocus
          locale={pt}
        />
      </PopoverContent>
    </Popover>
  );
}
