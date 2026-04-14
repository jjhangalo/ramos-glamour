import Image from "next/image";
import Link from "next/link";

import { ProductPrice } from "@/components/product/ProductPrice";

type PromoCardProps = {
  productId: string;
  name: string;
  price: number;
  promoPrice: number;
  imageUrl?: string | null;
};

export function PromoCard({
  productId,
  name,
  price,
  promoPrice,
  imageUrl,
}: PromoCardProps) {
  return (
    <Link
      href={`/produto/${productId}`}
      className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_30px_rgba(98,98,96,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(98,98,96,0.16)]"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageUrl ?? "https://picsum.photos/seed/promo-fallback/600/800"}
          alt={name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
        />

        {/* Static promo badge — no percentage to avoid rounding mismatch */}
        <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
          Promoção
        </span>
      </div>

      {/* Info */}
      <div className="space-y-3 p-4">
        <p
          className="font-semibold leading-snug text-brand-charcoal line-clamp-2"
          title={name}
        >
          {name}
        </p>
        {/* ProductPrice shows promo price + original struck-through + exact Kz savings badge */}
        <ProductPrice price={price} promoPrice={promoPrice} size="sm" />
      </div>
    </Link>
  );
}
