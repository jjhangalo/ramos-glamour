"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Star, User, ChevronRight } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { Product } from "@/lib/actions/products";
import { cn } from "@/lib/utils";
import { trackViewItem } from "@/lib/analytics";

type ProductDetailViewProps = {
  product: Product;
  promoPrice?: number | null;
};

export function ProductDetailView({ product, promoPrice }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: promoPrice || product.promo_price || product.price,
      category: product.categories?.[0]?.name,
    });
  }, [product, promoPrice]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const activeVariant = useMemo(() => {
    if (!hasVariants || !hasOptions) return null;
    if (!selectedSize && !selectedColor) return null;

    return product.variants?.find((v) => {
      const matchSize = !selectedSize || v.size === selectedSize;
      const matchColor = !selectedColor || v.color === selectedColor;
      return matchSize && matchColor;
    }) || null;
  }, [product.variants, selectedSize, selectedColor, hasVariants, hasOptions]);

  const allImages = useMemo(() => {
    if (activeVariant?.variant_images?.length) return activeVariant.variant_images;
    return product.images.length > 0 
      ? product.images 
      : [{ url: "https://picsum.photos/seed/fallback/600/900", position: 0 }];
  }, [product.images, activeVariant]);

  const currentStock = activeVariant?.stock ?? product.stock;
  const canAddToCart = currentStock > 0;
  const currentPrice = activeVariant?.price_override ?? product.price;
  const currentPromoPrice = activeVariant?.price_override ? null : promoPrice || product.promo_price;

  // Sync scroll position with active index (Mobile)
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / offsetWidth);
      if (index !== activeImageIndex) {
        setActiveImageIndex(index);
      }
    }
  };

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * index;
      scrollRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-24">
      {/* Breadcrumbs */}
      <nav className="mb-12 flex flex-wrap items-center gap-y-4 gap-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
        <Link href="/" className="px-1 py-2 hover:text-brand-midnight transition-colors">INÍCIO</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/catalogo" className="px-1 py-2 hover:text-brand-midnight transition-colors">CATÁLOGO</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="px-1 py-2 text-brand-midnight">{product.name}</span>
      </nav>

      <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        
        {/* Left: Enhanced Gallery */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Desktop Thumbnail Sidebar */}
          <div className="hidden lg:flex flex-col gap-4 w-20 shrink-0">
             {allImages.map((image, index) => (
               <button 
                 key={`${image.url}-${index}`}
                 onClick={() => scrollToImage(index)}
                 className={cn(
                   "relative aspect-[2/3] overflow-hidden border transition-all duration-300",
                   activeImageIndex === index ? "border-brand-gold" : "border-brand-midnight/5 opacity-50 hover:opacity-100"
                 )}
               >
                 <Image src={image.url} alt="Thumbnail" fill className="object-cover" sizes="80px" />
               </button>
             ))}
          </div>

          <div className="relative flex-1">
            {/* Main Carousel / Display */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:overflow-hidden lg:snap-none"
            >
              {allImages.map((image, index) => (
                <div 
                  key={`${image.url}-${index}`} 
                  className="relative aspect-[2/3] w-full flex-shrink-0 snap-center overflow-hidden bg-brand-midnight/5"
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - Vista ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </div>
              ))}
            </div>

            {/* Mobile Navigation Dots (Hidden on Desktop) */}
            <div className="mt-4 flex justify-center gap-2 lg:hidden">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToImage(index)}
                  className={cn(
                    "h-1 transition-all duration-300",
                    activeImageIndex === index ? "w-8 bg-brand-gold" : "w-2 bg-brand-midnight/10"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sticky Info Section */}
        <div className="lg:sticky lg:top-32 space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">
              {product.categories?.[0]?.name ?? "COLECÇÃO EXCLUSIVA"}
            </p>
            <h1 className="heading-luxury text-4xl font-light md:text-6xl">
              {product.name}
            </h1>
            <ProductPrice
              price={currentPrice}
              promoPrice={currentPromoPrice}
              size="lg"
            />
          </div>

          {/* Product Rating Summary */}
          <div className="flex items-center gap-4 text-xs tracking-widest text-brand-midnight/60">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-3 w-3", 
                    i < Math.round(product.rating_avg) ? "fill-brand-gold text-brand-gold" : "text-brand-midnight/10"
                  )} 
                />
              ))}
            </div>
            <span>{product.review_count} AVALIAÇÕES</span>
          </div>

          <p className="text-sm leading-relaxed text-brand-midnight/70 max-w-lg">
            {product.description}
          </p>

          {/* Options */}
          {hasOptions && (
            <div className="space-y-10 border-y border-brand-midnight/5 py-10">
              {sizes.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">TAMANHO</p>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                        className={cn(
                          "min-w-[4.5rem] min-h-[3rem] px-5 py-4 text-[11px] font-bold border transition-all duration-300 touch-manipulation",
                          selectedSize === size 
                            ? "bg-brand-midnight text-brand-white border-brand-midnight shadow-lg" 
                            : "border-brand-midnight/10 text-brand-midnight hover:border-brand-midnight active:bg-brand-midnight/5"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">COR</p>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                        className={cn(
                          "min-h-[3rem] px-8 py-4 text-[11px] font-bold border transition-all duration-300 touch-manipulation",
                          selectedColor === color 
                            ? "bg-brand-midnight text-brand-white border-brand-midnight shadow-lg" 
                            : "border-brand-midnight/10 text-brand-midnight hover:border-brand-midnight active:bg-brand-midnight/5"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-brand-midnight/10 bg-brand-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-5 transition-colors hover:bg-brand-midnight/5 active:bg-brand-midnight/10 touch-manipulation"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-14 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                  className="p-5 transition-colors hover:bg-brand-midnight/5 active:bg-brand-midnight/10 touch-manipulation"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {currentStock > 0 ? (
                <p className="text-[10px] font-bold text-green-600 tracking-widest">EM STOCK</p>
              ) : (
                <p className="text-[10px] font-bold text-red-600 tracking-widest">ESGOTADO</p>
              )}
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
              disabled={!canAddToCart || Boolean(hasOptions && !activeVariant && (selectedSize || selectedColor))}
              label={currentStock > 0 ? "ADICIONAR AO CARRINHO" : "INDISPONÍVEL"}
              className={cn(
                "w-full py-5 text-[11px] font-bold tracking-[0.3em] transition-all duration-500",
                canAddToCart 
                  ? "bg-brand-gold text-brand-white hover:bg-brand-midnight" 
                  : "bg-brand-midnight/10 text-brand-midnight/40 cursor-not-allowed"
              )}
            />
          </div>

          {/* Details Accordions */}
          <div className="pt-10 space-y-4 border-t border-brand-midnight/5">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between list-none py-6 text-[10px] font-bold tracking-[0.2em] text-brand-midnight/60 hover:text-brand-midnight transition-colors touch-manipulation">
                DETALHES DO PRODUTO
                <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
              </summary>
              <div className="pb-6 text-xs leading-relaxed text-brand-midnight/50 px-2">
                Peça exclusiva da colecção Ramos Glamour, desenhada com foco na elegância e sofisticação. Materiais de alta qualidade seleccionados para garantir durabilidade e conforto.
              </div>
            </details>
            <details className="group border-t border-brand-midnight/5">
              <summary className="flex cursor-pointer items-center justify-between list-none py-6 text-[10px] font-bold tracking-[0.2em] text-brand-midnight/60 hover:text-brand-midnight transition-colors touch-manipulation">
                ENVIOS & DEVOLUÇÕES
                <Plus className="h-4 w-4 transition-transform group-open:rotate-45" />
              </summary>
              <div className="pb-6 text-xs leading-relaxed text-brand-midnight/50 px-2">
                Envios para todo o território nacional. Tempo estimado de entrega entre 2 a 5 dias úteis. Devoluções gratuitas num prazo de 14 dias após a recepção do produto.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-32 pt-24 border-t border-brand-midnight/5">
        <div className="flex flex-col items-center text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">Testemunhos</p>
          <h2 className="heading-luxury mt-4 text-3xl font-light md:text-5xl">Avaliações de <span className="italic">Clientes</span></h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(product.reviews?.length ?? 0) > 0 ? (
            product.reviews?.map((review) => (
              <div key={review.id} className="p-8 border border-brand-midnight/5 bg-brand-white/50 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn("h-3 w-3", i < review.rating ? "fill-brand-gold text-brand-gold" : "text-brand-midnight/10")} 
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold tracking-widest text-brand-midnight/30">
                    {new Date(review.created_at).toLocaleDateString("pt-AO")}
                  </span>
                </div>
                <p className="text-sm italic leading-relaxed text-brand-midnight/70">&quot;{review.comment}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-brand-gold" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">{review.profiles?.display_name || "Cliente Verificado"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-[11px] font-medium tracking-widest text-brand-midnight/40 italic">
              Ainda não existem avaliações para este produto.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
