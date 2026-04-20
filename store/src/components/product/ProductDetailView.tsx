"use client";

import { useState, useMemo, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";

import { Minus, Plus, Star, User } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils/format";

type ProductDetailViewProps = {
  product: Product;
  promoPrice?: number | null;
};

export function ProductDetailView({ product, promoPrice }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || { url: "https://picsum.photos/seed/fallback/600/800", position: 0 },
  );
  const [quantity, setQuantity] = useState(1);

  // Variation states
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Available options
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const sizes = useMemo(() => {
    const s = new Set(product.variants?.map((v) => v.size).filter(Boolean));
    return Array.from(s) as string[];
  }, [product.variants]);

  const colors = useMemo(() => {
    const c = new Set(product.variants?.map((v) => v.color).filter(Boolean));
    return Array.from(c) as string[];
  }, [product.variants]);

  // Find active variant
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants?.find((v) => {
      const matchSize = !selectedSize || v.size === selectedSize;
      const matchColor = !selectedColor || v.color === selectedColor;
      return matchSize && matchColor && v.is_available;
    });
  }, [product.variants, selectedSize, selectedColor, hasVariants]);

  // Update gallery if variant has images
  useEffect(() => {
    if (activeVariant?.variant_images?.length) {
      const firstImage = activeVariant.variant_images[0];
      setSelectedImage((prev) => (prev.url === firstImage.url ? prev : firstImage));
    }
  }, [selectedSize, selectedColor, activeVariant]);

  const currentPrice = activeVariant?.price_override ?? product.price;
  const currentPromoPrice = activeVariant?.price_override ? null : promoPrice || product.promo_price;

  const canAddToCart = !hasVariants || (!!activeVariant && (!!selectedSize || !sizes.length) && (!!selectedColor || !colors.length));

  const allImages = useMemo(() => {
    const variantImages = activeVariant?.variant_images || [];
    // Combine but avoid duplicates if possible, or just show variant images first
    if (variantImages.length > 0) return variantImages;
    return product.images;
  }, [product.images, activeVariant]);

  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(98,98,96,0.08)]">
            <Image
              src={selectedImage.url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {allImages.map((image, idx) => {
              const isActive = image.url === selectedImage.url;

              return (
                <button
                  key={`${image.url}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(image);
                  }}
                  className={`relative aspect-[3/4] overflow-hidden rounded-2xl border transition ${
                    isActive
                      ? "border-brand-olive ring-2 ring-brand-olive/25"
                      : "border-brand-white/20 hover:border-brand-mauve"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-brand-charcoal/70">
            <Link href="/" className="transition hover:text-brand-charcoal">
              Início
            </Link>
            <span>&gt;</span>
            <Link href="/catalogo" className="transition hover:text-brand-charcoal">
              Catálogo
            </Link>
            <span>&gt;</span>
            <span className="text-brand-charcoal">{product.name}</span>
          </nav>

          <span className="inline-flex rounded-full bg-brand-mauve px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-brand-white">
            {product.categories?.[0]?.name ?? "Sem categoria"}
          </span>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-brand-charcoal md:text-5xl">
              {product.name}
            </h1>
            <a
              href="#avaliacoes"
              className="flex items-center gap-3 text-sm text-brand-charcoal/75 transition hover:text-brand-charcoal"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${product.id}-detail-star-${index}`}
                    className={`h-4 w-4 ${
                      index < Math.round(product.rating_avg)
                        ? "fill-brand-olive text-brand-olive"
                        : "text-brand-charcoal/20"
                    }`}
                  />
                ))}
              </div>
              <span>{product.rating_avg.toFixed(1)}</span>
              <span>({product.review_count} avaliações)</span>
            </a>
          </div>

          <ProductPrice
            price={currentPrice}
            promoPrice={currentPromoPrice}
            size="lg"
          />

          <p className="max-w-xl text-base leading-8 text-brand-charcoal/80">
            {product.description}
          </p>

          {/* Variation Selectors */}
          {hasVariants && (
            <div className="space-y-6 border-y border-brand-charcoal/10 py-6">
              {sizes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-charcoal">
                    Tamanho
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                        className={`min-w-[3rem] rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          selectedSize === size
                            ? "border-brand-olive bg-brand-olive text-brand-white shadow-md"
                            : "border-brand-charcoal/15 bg-white text-brand-charcoal hover:border-brand-mauve"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand-charcoal">
                    Cor
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                          selectedColor === color
                            ? "border-brand-olive bg-brand-olive text-brand-white shadow-md"
                            : "border-brand-charcoal/15 bg-white text-brand-charcoal hover:border-brand-mauve"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {!activeVariant && (selectedSize || selectedColor) && (
                <p className="text-xs font-medium text-red-500">
                  Esta combinação não está disponível de momento.
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-charcoal/70">
              Quantidade
            </p>
            <div className="inline-flex items-center rounded-full border border-brand-charcoal/15 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setQuantity((current) => Math.max(1, current - 1));
                }}
                className="rounded-full p-3 text-brand-charcoal transition hover:bg-brand-bg"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setQuantity(Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue));
                }}
                className="w-16 bg-transparent text-center text-base font-medium text-brand-charcoal outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setQuantity((current) => current + 1);
                }}
                className="rounded-full p-3 text-brand-charcoal transition hover:bg-brand-bg"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AddToCartButton
            product={product}
            quantity={quantity}
            variant={activeVariant ? {
              id: activeVariant.id,
              size: activeVariant.size,
              color: activeVariant.color,
              price_override: activeVariant.price_override
            } : undefined}
            disabled={!canAddToCart}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-medium transition ${
              canAddToCart 
                ? "bg-brand-olive text-brand-white hover:bg-[#8a904d] shadow-lg active:scale-[0.98]" 
                : "bg-brand-charcoal/10 text-brand-charcoal/40 cursor-not-allowed"
            }`}
          />
          {!canAddToCart && hasVariants && (
            <p className="text-center text-xs text-brand-charcoal/50">
              Por favor, seleciona as opções acima para adicionar ao carrinho.
            </p>
          )}
        </div>
      </section>

      <section
        id="avaliacoes"
        className="rounded-[2rem] bg-white/80 p-8 shadow-[0_16px_35px_rgba(98,98,96,0.08)]"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-brand-charcoal">Avaliações</h2>
          <div className="flex items-center gap-2 rounded-full bg-brand-bg px-4 py-2 text-brand-olive">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-lg font-bold">{product.rating_avg.toFixed(1)}</span>
            <span className="text-sm opacity-60">/ 5.0</span>
          </div>
        </div>
        
        <div className="mt-8 space-y-6">
          {(product.reviews?.length ?? 0) > 0 ? (
            product.reviews?.map((review) => (
              <div key={review.id} className="space-y-3 rounded-2xl border border-brand-charcoal/5 bg-brand-white/50 p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-mauve/10 text-brand-mauve">
                      {review.profiles?.avatar_url ? (
                        <Image 
                          src={review.profiles.avatar_url} 
                          alt={review.profiles.display_name || "Utilizador"} 
                          width={40} 
                          height={40} 
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-charcoal">
                        {review.profiles?.display_name || "Cliente verificado"}
                      </p>
                      <p className="text-xs text-brand-charcoal/50">
                        {new Date(review.created_at).toLocaleDateString("pt-AO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < review.rating ? "fill-brand-olive text-brand-olive" : "text-brand-charcoal/10"}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-brand-charcoal/80">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-charcoal/20 bg-brand-white/70 px-5 py-12 text-center">
              <p className="text-brand-charcoal/50">
                Ainda não há avaliações para este produto. Seja o primeiro a avaliar!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
