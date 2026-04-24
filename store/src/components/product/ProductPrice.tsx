import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  price: number;
  promoPrice?: number | null;
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
};

const sizeMap = {
  sm: { current: "text-sm tracking-widest", original: "text-[10px]" },
  md: { current: "text-lg tracking-widest", original: "text-sm" },
  lg: { current: "text-2xl tracking-widest md:text-3xl", original: "text-base" },
};

export function ProductPrice({
  price,
  promoPrice,
  size = "md",
  inverse = false,
}: ProductPriceProps) {
  const styles = sizeMap[size];
  const hasPromo = promoPrice !== null && promoPrice !== undefined && promoPrice > 0;

  return (
    <div className="flex items-baseline gap-3">
      <p 
        className={cn(
          "font-sans font-medium",
          styles.current,
          hasPromo ? "text-brand-gold" : inverse ? "text-brand-white" : "text-brand-midnight"
        )}
        suppressHydrationWarning
      >
        {formatPrice(hasPromo ? promoPrice! : price)}
      </p>
      {hasPromo && (
        <p 
          className={cn(
            "font-sans line-through opacity-40",
            styles.original,
            inverse ? "text-brand-white" : "text-brand-midnight"
          )}
          suppressHydrationWarning
        >
          {formatPrice(price)}
        </p>
      )}
    </div>
  );
}
