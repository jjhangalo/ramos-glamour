"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileCardRowProps = {
  thumbnail?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
  isFeatured?: boolean;
  actions?: React.ReactNode;
  className?: string;
};

export function MobileCardRow({
  thumbnail,
  title,
  subtitle,
  meta,
  badge,
  isFeatured,
  actions,
  className,
}: MobileCardRowProps) {
  return (
    <div className={cn("flex min-h-[72px] items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors", className)}>
      {/* Left: Thumbnail Slot */}
      {thumbnail && (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-100 shadow-sm">
          {thumbnail}
        </div>
      )}

      {/* Middle: Content flex-col */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Line 1: Title + Featured Icon */}
        <div className="flex items-center gap-1.5">
          <div className="truncate font-medium text-slate-900 text-sm">
            {title}
          </div>
          {isFeatured && (
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
          )}
        </div>

        {/* Line 2: Subtitle */}
        {subtitle && (
          <div className="truncate text-xs text-slate-500">
            {subtitle}
          </div>
        )}

        {/* Line 3: Meta + Badge Inline */}
        {(meta || badge) && (
          <div className="mt-1 flex items-center gap-3">
            {meta && (
              <span className="text-sm font-semibold text-slate-900">
                {meta}
              </span>
            )}
            {badge && (
              <div className="text-[9px] font-bold uppercase tracking-wider">
                {badge}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions Slot */}
      {actions && (
        <div className="shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
