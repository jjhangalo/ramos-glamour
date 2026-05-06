"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, X, Info } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { promotionSchema, type PromotionFormValues } from "@/lib/validations/promotion";
import { upsertPromotion } from "@/lib/actions/promotions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format, addDays, addMonths } from "date-fns";

type VariantOption = {
  id: string;
  size: string | null;
  color: string | null;
  price_override: number | null;
};

type ProductOption = {
  id: string;
  name: string;
  price: number;
  variants: VariantOption[];
};

interface PromotionFormClientProps {
  products: ProductOption[];
  initialData?: PromotionFormValues & { id?: string };
}

export function PromotionFormClient({ products, initialData }: PromotionFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: initialData || {
      product_id: "",
      variant_id: null,
      promo_price: 0,
      is_active: true,
      starts_at: format(new Date(), "yyyy-MM-dd"),
      ends_at: null,
    },
  });

  const selectedProductId = form.watch("product_id");
  const selectedVariantId = form.watch("variant_id");
  const startsAt = form.watch("starts_at");

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId);

  const referencePrice = selectedVariant?.price_override ?? selectedProduct?.price ?? 0;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleRemoveProduct = () => {
    form.setValue("product_id", "");
    form.setValue("variant_id", null);
    setProductSearch("");
  };

  const handleRemoveVariant = () => {
    form.setValue("variant_id", null);
  };

  async function onSubmit(values: PromotionFormValues) {
    startTransition(async () => {
      try {
        const result = await upsertPromotion({
          ...values,
          id: initialData?.id,
        });

        if (result.success) {
          toast.success(initialData?.id ? "Promoção atualizada" : "Promoção criada");
          router.push("/promocoes");
          router.refresh();
        } else {
          toast.error(result.error || "Erro ao guardar promoção");
        }
      } catch {
        toast.error("Ocorreu um erro inesperado");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 sm:p-8 shadow-sm border border-brand-midnight/5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">

            {/* Produto */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">Produto Base</FormLabel>
                    <div className="relative" ref={productDropdownRef}>
                      {selectedProduct ? (
                        <div className="flex w-full items-center justify-between rounded-xl border border-brand-midnight/10 bg-brand-bg/50 px-4 py-3 text-sm">
                          <span className="font-medium text-brand-midnight">{selectedProduct.name}</span>
                          <button
                            type="button"
                            onClick={handleRemoveProduct}
                            className="rounded-full p-1 text-brand-midnight/40 hover:bg-brand-midnight/10 hover:text-brand-midnight transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-midnight/40" />
                            <input
                              type="search"
                              value={productSearch}
                              onChange={(e) => {
                                setProductSearch(e.target.value);
                                setIsProductDropdownOpen(true);
                              }}
                              onFocus={() => setIsProductDropdownOpen(true)}
                              placeholder="Pesquisar produto pelo nome..."
                              className="w-full rounded-xl border border-brand-midnight/10 py-3 pl-10 pr-4 text-sm text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20"
                            />
                          </div>

                          {isProductDropdownOpen && (
                            <div className="absolute top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-brand-midnight/10 bg-white shadow-2xl">
                              {filteredProducts.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-brand-midnight/50">Nenhum produto encontrado.</p>
                              ) : (
                                filteredProducts.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(product.id);
                                      setIsProductDropdownOpen(false);
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-sm transition hover:bg-brand-bg/50"
                                  >
                                    <span className="font-medium text-brand-midnight">{product.name}</span>
                                    <span className="text-brand-midnight/50 font-mono text-xs">
                                      {formatPrice(product.price)}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Variante */}
            {selectedProduct && selectedProduct.variants.length > 0 && (
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="variant_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">
                        Variante (Opcional)
                      </FormLabel>

                      <div className="relative">
                        {selectedVariant ? (
                          <div className="flex w-full items-center justify-between rounded-xl border border-brand-midnight/10 bg-brand-bg/50 px-4 py-3 text-sm">
                            <span className="font-medium text-brand-midnight">
                              {selectedVariant.size && `Tam: ${selectedVariant.size}`}
                              {selectedVariant.size && selectedVariant.color && " | "}
                              {selectedVariant.color && `Cor: ${selectedVariant.color}`}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveVariant}
                              className="rounded-full p-1 text-brand-midnight/40 hover:bg-brand-midnight/10 hover:text-brand-midnight transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <CustomSelect
                            value={field.value || ""}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Aplicar a todas as opções"
                            options={selectedProduct.variants.map((v) => ({
                              value: v.id,
                              label: [v.size ? `Tam: ${v.size}` : "", v.color ? `Cor: ${v.color}` : ""]
                                .filter(Boolean)
                                .join(" | ") || `Opção ${v.id.slice(0, 4)}`,
                              price: v.price_override ? formatPrice(v.price_override) : undefined,
                            }))}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Price Info */}
            {selectedProduct && (
              <div className="col-span-2 flex items-center gap-3 rounded-xl bg-brand-gold/5 p-4 text-sm text-brand-midnight/80 border border-brand-gold/20">
                <Info className="h-5 w-5 text-brand-gold" />
                <span>
                  Preço base de referência:{" "}
                  <strong className="text-brand-midnight font-mono text-lg ml-1">{formatPrice(referencePrice)}</strong>
                </span>
              </div>
            )}

            {/* Promo price */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="promo_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">
                      Preço promocional (Kz)
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={isPending}
                        placeholder="Ex: 19900"
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        className="w-full rounded-xl border border-brand-midnight/10 px-4 py-3 text-sm font-mono text-brand-midnight outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:bg-brand-bg/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Starts at */}
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">
                      Data de início
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? parseISO(field.value) : null}
                        setDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                        disabled={isPending}
                        placeholder="Começa em..."
                      />
                    </FormControl>
                    <div className="flex flex-nowrap overflow-x-auto gap-1 mt-2 pb-1 no-scrollbar">
                      {[
                        { label: "Amanhã", days: 1 },
                        { label: "3 dias", days: 3 },
                        { label: "1 semana", weeks: 1 },
                        { label: "1 mês", months: 1 },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            let d = new Date();
                            if (chip.days) d = addDays(d, chip.days);
                            if (chip.weeks) d = addDays(d, chip.weeks * 7);
                            if (chip.months) d = addMonths(d, chip.months);
                            field.onChange(format(d, "yyyy-MM-dd"));
                          }}
                          className="text-[10px] px-2 py-1 rounded-full bg-brand-midnight/5 text-brand-midnight/60 hover:bg-brand-midnight/10 transition-colors border border-brand-midnight/5"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ends at */}
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="ends_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-brand-midnight/60">
                      Data de fim (opcional)
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value ? parseISO(field.value) : null}
                        setDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : null)}
                        disabled={isPending}
                        placeholder="Termina em..."
                      />
                    </FormControl>
                    <div className="flex flex-nowrap overflow-x-auto gap-1 mt-2 pb-1 no-scrollbar">
                      {[
                        { label: "3 dias", days: 3 },
                        { label: "5 dias", days: 5 },
                        { label: "1 sem.", weeks: 1 },
                        { label: "1 mês", months: 1 },
                      ].map((chip) => {
                        const isDisabled = !startsAt;

                        return (
                          <button
                            key={chip.label}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!startsAt) return;
                              let d = parseISO(startsAt);
                              if (chip.days) d = addDays(d, chip.days);
                              if (chip.weeks) d = addDays(d, chip.weeks * 7);
                              if (chip.months) d = addMonths(d, chip.months);
                              field.onChange(format(d, "yyyy-MM-dd"));
                            }}
                            className={cn(
                              "text-[10px] px-2 py-1 rounded-full transition-colors border",
                              isDisabled
                                ? "bg-transparent text-brand-midnight/10 border-brand-midnight/5 cursor-not-allowed"
                                : "bg-brand-midnight/5 text-brand-midnight/60 hover:bg-brand-midnight/10 border-brand-midnight/5"
                            )}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Is Active */}
            <div className="col-span-2 pt-4 border-t border-brand-midnight/5">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        disabled={isPending}
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-5 w-5 rounded border-brand-midnight/20 text-brand-gold accent-brand-midnight focus:ring-brand-gold/20"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium text-brand-midnight cursor-pointer">
                        Ativar promoção imediatamente
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      <StickySaveBar
        isDirty={form.formState.isDirty || !!selectedProduct}
        isSaving={isPending}
        onSave={form.handleSubmit(onSubmit)}
        onReset={() => {
          form.reset();
          setProductSearch("");
        }}
      />
    </div>
  );
}
