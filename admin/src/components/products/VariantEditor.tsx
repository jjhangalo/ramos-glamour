"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ProductVariantRecord } from "@/lib/types";
import { VariantForm } from "./VariantForm";

type VariantEditorProps = {
  productId: string;
  variant?: ProductVariantRecord | null;
  isOpen: boolean;
  onClose: () => void;
};

export function VariantEditor({
  productId,
  variant,
  isOpen,
  onClose,
}: VariantEditorProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl border-l border-brand-midnight/5 p-0 sm:rounded-l-[2rem] overflow-hidden"
      >
        <div className="relative h-full flex flex-col bg-brand-bg grain-overlay">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 px-8 py-6 border-b border-brand-midnight/5 bg-white/50 backdrop-blur-md">
            <SheetTitle className="heading-luxury text-2xl font-light text-brand-midnight">
              {variant ? "Editar Variante" : "Nova Variante"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-10">
            <VariantForm 
              productId={productId} 
              variant={variant} 
              onClose={onClose} 
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
