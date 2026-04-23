import Image from "next/image";
import Link from "next/link";

import { Star } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/actions/products";

type ProductCardProps = {
  product: Product;
  promoPrice?: number | null;
};

export function ProductCard({ product, promoPrice }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_rgba(98,98,96,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/produto/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden md:h-64">
          <Image
            src={product.images[0]?.url ?? "https://picsum.photos/seed/fallback/600/800"}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <span className="absolute left-3 top-3 rounded-full bg-brand-mauve px-3 py-1 text-xs font-medium text-brand-white shadow-sm">
            {product.categories?.[0]?.name ?? "Sem categoria"}
          </span>
          {promoPrice || product.promo_price ? (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Promoção
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5 p-3 pb-0 md:p-4 md:pb-0">
          <h3 className="text-sm font-semibold text-brand-charcoal md:text-base">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/75">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${product.id}-star-${index}`}
                  className="h-3 w-3 fill-brand-olive text-brand-olive"
                />
              ))}
            </div>
            <span>{product.rating_avg.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>
        </div>
      </Link>

      <div className="p-3 pt-3 md:p-4 md:pt-3">
        <div className="flex items-center justify-between gap-3">
          <ProductPrice
            price={product.price}
            promoPrice={promoPrice || product.promo_price}
            size="md"
          />
          <AddToCartButton
            product={product}
            compact
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-olive px-3 py-1.5 text-xs font-medium text-brand-white transition hover:bg-[#8a904d] md:px-4 md:py-2 md:text-sm"
          />
        </div>
      </div>
    </article>
  );
}
