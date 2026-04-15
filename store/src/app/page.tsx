import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Tag } from "lucide-react";

import { ProductCard } from "@/components/product/ProductCard";
import { getPublicCategories } from "@/lib/actions/public-categories";
import { getPublicProducts } from "@/lib/actions/public-products";

export default async function Home() {
  const [promoProducts, featuredProducts, latestProducts, categories] =
    await Promise.all([
      getPublicProducts({ hasPromo: true, limit: 4 }),
      getPublicProducts({ isFeatured: true, limit: 4 }),
      getPublicProducts({ limit: 8 }),
      getPublicCategories(),
    ]);

  return (
    <main className="flex flex-1 flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-bg">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,#ffffff70,transparent_60%)] lg:block" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-8 lg:py-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-charcoal/65">
              Ramos Glamour
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] text-brand-charcoal md:text-6xl">
                Descobre o teu estilo
              </h1>
              <p className="max-w-xl text-lg leading-8 text-brand-charcoal/80">
                Moda feminina por encomenda, escolhida para quem procura elegância,
                leveza e presença em cada detalhe.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-full bg-brand-olive px-6 py-3 text-base font-medium text-brand-white transition hover:bg-[#8a904d]"
            >
              Ver catálogo
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className={`relative overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(98,98,96,0.12)] ${
                  index % 2 === 0 ? "translate-y-0 sm:translate-y-8" : ""
                }`}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={product.images[0]?.url ?? "https://picsum.photos/seed/fallback/600/800"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promoções ────────────────────────────────────────────────── */}
      {promoProducts.length > 0 && (
        <section className="bg-gradient-to-b from-emerald-50 to-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-16 lg:px-8">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <Tag className="h-3.5 w-3.5" />
                  Tempo limitado
                </div>
                <h2 className="text-xl font-semibold text-brand-charcoal md:text-3xl">
                  Ofertas Imperdíveis
                </h2>
                <p className="mt-1 text-sm text-brand-charcoal/65">
                  Aproveita os melhores preços enquanto há stock.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition hover:text-emerald-900 sm:mt-0"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Categorias ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-16 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
              Categorias
            </p>
            <h2 className="mt-2 text-xl font-semibold text-brand-charcoal md:text-3xl">
              Categorias em destaque
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.slice(0, 3).map((category) => {
            // Find a product in this category for the image
            const categoryMatch = (p: any) =>
              Array.isArray(p.categories)
                ? p.categories.some((c: any) => c.slug === category.slug)
                : p.categories?.slug === category.slug;

            const productWithImage =
              latestProducts.find(categoryMatch) || featuredProducts.find(categoryMatch);

            return (
              <Link
                key={category.id}
                href={`/catalogo?categoria=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(98,98,96,0.12)]"
              >
                <div className="relative aspect-[5/6]">
                  <Image
                    src={
                      productWithImage?.images[0]?.url ??
                      "https://picsum.photos/seed/cat-fallback/600/800"
                    }
                    alt={category.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-3xl font-semibold text-brand-white">
                      {category.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Produtos em destaque ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 md:pb-16 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
              Seleção
            </p>
            <h2 className="mt-2 text-xl font-semibold text-brand-charcoal md:text-3xl">
              Produtos em destaque
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-medium text-brand-charcoal transition hover:text-brand-olive"
          >
            Ver tudo
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
