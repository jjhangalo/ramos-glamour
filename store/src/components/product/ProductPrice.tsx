import { formatPrice } from "@/lib/utils/format";

type ProductPriceProps = {
  price: number;
  promoPrice?: number | null;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { current: "text-base font-semibold", original: "text-sm" },
  md: { current: "text-lg font-semibold", original: "text-sm" },
  lg: { current: "text-3xl font-semibold", original: "text-lg" },
};

export function ProductPrice({
  price,
  promoPrice,
  size = "md",
}: ProductPriceProps) {
  const styles = sizeMap[size];
  const hasPromo = promoPrice !== null && promoPrice !== undefined && promoPrice > 0;

  if (!hasPromo) {
    return (
      <p 
        className={`${styles.current} text-brand-charcoal`}
        suppressHydrationWarning
      >
        {formatPrice(price)}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p 
        className={`${styles.current} text-emerald-700`}
        suppressHydrationWarning
      >
        {formatPrice(promoPrice!)}
      </p>
      <p 
        className={`${styles.original} text-brand-charcoal/50 line-through`}
        suppressHydrationWarning
      >
        {formatPrice(price)}
      </p>
    </div>
  );
}
