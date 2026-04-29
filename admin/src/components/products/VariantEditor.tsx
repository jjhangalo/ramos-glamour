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
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[2rem] px-6 pb-10 pt-8 sm:h-auto sm:max-w-xl sm:rounded-l-[2rem] sm:side-right md:hidden">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <SheetTitle>{variant ? "Editar Variante" : "Nova Variante"}</SheetTitle>
        </SheetHeader>

        <VariantForm 
          productId={productId} 
          variant={variant} 
          onClose={onClose} 
        />
      </SheetContent>
    </Sheet>
  );
}
