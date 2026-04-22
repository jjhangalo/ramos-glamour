"use client";

import { useState, useMemo, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";

import { AlertTriangle, Check, ChevronLeft, ChevronRight, Minus, Plus, Star, User, X } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/actions/products";

type ProductDetailViewProps = {
  product: Product;
  promoPrice?: number | null;
};

export function ProductDetailView({ product, promoPrice }: ProductDetailViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
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

  const hasOptions = sizes.length > 0 || colors.length > 0;

  // Find active variant
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    
    if (!hasOptions) {
      return product.variants?.find((v) => v.is_available) || product.variants?.[0] || null;
    }

    const needsSize = sizes.length > 0;
    const needsColor = colors.length > 0;

    if ((needsSize && !selectedSize) || (needsColor && !selectedColor)) {
      return null;
    }

    return product.variants?.find((v) => {
      const matchSize = !needsSize || v.size === selectedSize;
      const matchColor = !needsColor || v.color === selectedColor;
      return matchSize && matchColor;
    }) || null;
  }, [product.variants, selectedSize, selectedColor, hasVariants, hasOptions, sizes.length, colors.length]);

  const hasExplicitSelection = selectedSize !== null || selectedColor !== null;

  const allImages = useMemo(() => {
    if (hasExplicitSelection && activeVariant?.variant_images?.length) {
      return activeVariant.variant_images;
    }
    return product.images.length > 0 
      ? product.images 
      : [{ url: "https://picsum.photos/seed/fallback/600/800", position: 0 }];
  }, [product.images, activeVariant, hasExplicitSelection]);

  // Update gallery if variant has images
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex(0);
  }, [allImages]);



  // Touch handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const currentStock = activeVariant?.stock ?? product.stock;

  // Adjust quantity based on stock (Sync state during render)
  if (currentStock === 0 && quantity !== 1) {
    setQuantity(1);
  } else if (currentStock > 0 && quantity > currentStock) {
    setQuantity(currentStock);
  }

  const canAddToCart = currentStock > 0;

  const addToCartLabel = currentStock === 0 ? "Sem stock disponível" : "Adicionar ao carrinho";

  const currentPrice = activeVariant?.price_override ?? product.price;
  const currentPromoPrice = activeVariant?.price_override ? null : promoPrice || product.promo_price;

  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4 overflow-hidden">
          <div 
            className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(98,98,96,0.08)]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            {allImages.map((image, index) => (
              <Image
                key={`main-${image.url}-${index}`}
                src={image.url}
                alt={`${product.name} - Imagem ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-300 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={index === 0}
              />
            ))}
            
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-brand-charcoal shadow-sm backdrop-blur-sm transition hover:bg-white md:p-3"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-brand-charcoal shadow-sm backdrop-blur-sm transition hover:bg-white md:p-3"
                  aria-label="Imagem seguinte"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
                
                {/* Dots Mobile */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
                  {allImages.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      type="button"
                      aria-label={`Ir para a imagem ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`rounded-full transition-all ${
                        index === activeIndex 
                          ? "h-2 w-2 bg-brand-olive" 
                          : "h-1.5 w-1.5 bg-brand-charcoal/20"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnails Desktop */}
          {allImages.length > 1 && (
            <div className="hidden overflow-x-auto scrollbar-hide md:flex md:gap-3 [&::-webkit-scrollbar]:hidden">
              {allImages.map((image, idx) => {
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={`thumb-${image.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl border transition ${
                      isActive
                        ? "border-brand-olive ring-2 ring-brand-olive/25"
                        : "border-transparent hover:border-brand-mauve"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} miniatura ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                );
              })}
            </div>
          )}
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

          <div className="flex flex-wrap gap-2">
            {currentStock > 10 ? (
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5">
                <Check className="h-3 w-3" />
                Em stock
              </div>
            ) : currentStock > 0 ? (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Apenas {currentStock} unidades
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5">
                <X className="h-3 w-3" />
                Sem stock
              </div>
            )}
          </div>

          <p className="max-w-xl text-base leading-8 text-brand-charcoal/80">
            {product.description}
          </p>

          {/* Variation Selectors */}
          {hasOptions && (
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
                disabled={quantity <= 1}
                onClick={() => {
                  setQuantity((current) => Math.max(1, current - 1));
                }}
                className="rounded-full p-3 text-brand-charcoal transition hover:bg-brand-bg disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={currentStock}
                value={quantity}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  const safeValue = Number.isNaN(nextValue) ? 1 : Math.max(1, nextValue);
                  setQuantity(Math.min(safeValue, currentStock));
                }}
                className="w-16 bg-transparent text-center text-base font-medium text-brand-charcoal outline-none"
              />
              <button
                type="button"
                disabled={quantity >= currentStock}
                onClick={() => {
                  setQuantity((current) => Math.min(current + 1, currentStock));
                }}
                className="rounded-full p-3 text-brand-charcoal transition hover:bg-brand-bg disabled:opacity-30 disabled:cursor-not-allowed"
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
            variantImage={activeVariant?.variant_images?.[0]?.url}
            disabled={!canAddToCart}
            label={addToCartLabel}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-medium transition ${
              canAddToCart 
                ? "bg-brand-olive text-brand-white hover:bg-[#8a904d] shadow-lg active:scale-[0.98]" 
                : "bg-brand-charcoal/10 text-brand-charcoal/40 cursor-not-allowed"
            }`}
          />
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
