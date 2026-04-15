"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Minus, Plus, Star } from "lucide-react";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductPrice } from "@/components/product/ProductPrice";
import type { PublicProduct } from "@/lib/actions/public-products";

type ProductDetailViewProps = {
  product: PublicProduct;
  promoPrice?: number | null;
};

export function ProductDetailView({ product, promoPrice }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || { url: "https://picsum.photos/seed/fallback/600/800", position: 0 },
  );
  const [quantity, setQuantity] = useState(1);

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
            {product.images.map((image) => {
              const isActive = image.id === selectedImage.id;

              return (
                <button
                  key={image.id}
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
                    alt={`${product.name} miniatura ${image.position + 1}`}
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
            {product.categories[0]?.name ?? "Sem categoria"}
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
                    className="h-4 w-4 fill-brand-olive text-brand-olive"
                  />
                ))}
              </div>
              <span>{product.rating_avg.toFixed(1)}</span>
              <span>({product.review_count} avaliações)</span>
            </a>
          </div>

          <ProductPrice
            price={product.price}
            promoPrice={promoPrice || product.promo_price}
            size="lg"
          />

          <p className="max-w-xl text-base leading-8 text-brand-charcoal/80">
            {product.description}
          </p>

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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-olive px-6 py-4 text-base font-medium text-brand-white transition hover:bg-[#8a904d]"
          />
        </div>
      </section>

      <section
        id="avaliacoes"
        className="rounded-[2rem] bg-white/80 p-8 shadow-[0_16px_35px_rgba(98,98,96,0.08)]"
      >
        <h2 className="text-3xl font-semibold text-brand-charcoal">Avaliações</h2>
        <div className="mt-6 rounded-2xl border border-dashed border-brand-charcoal/20 bg-brand-white/70 px-5 py-8 text-brand-charcoal/75">
          Ainda não há avaliações para este produto.
        </div>
      </section>
    </div>
  );
}
