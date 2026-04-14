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
  const discount =
    hasPromo && price > 0
      ? Math.round(((price - promoPrice!) / price) * 100)
      : 0;

  if (!hasPromo) {
    return (
      <p className={`${styles.current} text-brand-charcoal`}>
        {formatPrice(price)}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className={`${styles.current} text-emerald-700`}>
        {formatPrice(promoPrice!)}
      </p>
      <p className={`${styles.original} text-brand-charcoal/50 line-through`}>
        {formatPrice(price)}
      </p>
      {discount > 0 && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          -{discount}%
        </span>
      )}
    </div>
  );
}
