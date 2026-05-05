"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center items-center mb-4 relative h-10",
        caption_label: "text-sm font-bold text-brand-midnight",
        nav: "flex items-center absolute left-0 right-0 justify-between pointer-events-none px-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-50 hover:opacity-100 rounded-lg pointer-events-auto hover:bg-brand-bg"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-50 hover:opacity-100 rounded-lg pointer-events-auto hover:bg-brand-bg"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full justify-between mb-2",
        weekday:
          "text-brand-midnight/40 w-9 font-normal text-[10px] uppercase tracking-widest text-center flex-1",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center flex-1",
        day_button: cn(
          "h-9 w-9 p-0 font-normal transition-all rounded-full flex items-center justify-center text-brand-midnight/70 hover:bg-brand-gold/10 hover:text-brand-gold outline-none"
        ),
        selected: "bg-brand-gold/20 text-brand-gold font-bold hover:bg-brand-gold/30 rounded-full",
        today: "border border-brand-gold/20 text-brand-gold/40",
        outside: "text-brand-midnight/5",
        disabled: "text-brand-midnight/5 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeft className="h-4 w-4" />;
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
