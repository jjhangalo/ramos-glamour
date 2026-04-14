"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Star } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/mock/products";

type ProductCardProps = {
  product: Product;
  promoPrice?: number | null;
};

export function ProductCard({ product, promoPrice }: ProductCardProps) {
  const router = useRouter();

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => {
        router.push(`/produto/${product.id}`);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/produto/${product.id}`);
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[1.5rem] bg-white shadow-[0_16px_40px_rgba(98,98,96,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(98,98,96,0.16)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.images[0]?.url ?? "https://picsum.photos/seed/fallback/600/800"}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand-mauve px-3 py-1 text-xs font-medium text-brand-white shadow-sm">
          {product.category.name}
        </span>
        {promoPrice ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Promoção
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-brand-charcoal">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-brand-charcoal/75">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${product.id}-star-${index}`}
                  className="h-4 w-4 fill-brand-olive text-brand-olive"
                />
              ))}
            </div>
            <span>{product.rating_avg.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <ProductPrice price={product.price} promoPrice={promoPrice} size="md" />
          <AddToCartButton
            product={product}
            compact
            className="inline-flex items-center gap-2 rounded-full bg-brand-olive px-4 py-2 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
          />
        </div>
      </div>
    </article>
  );
}
