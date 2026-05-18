import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/actions/products";
import { cn } from "@/lib/utils";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const rootCategories = categories.filter((c) => !c.parent_id);
  const hasProducts = featuredProducts.length > 0;
  const hasCategories = rootCategories.length > 0;

  return (
    <main className="flex flex-1 flex-col">
      {/* ── Full-Bleed Cinematic Hero ───────────────────────────────── */}
      <section className="relative h-[90vh] w-full overflow-hidden grain-overlay">
        <ParallaxImage
          src="/hero.png"
          alt="Ramos Glamour - Coleção de Luxo"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          speed={60}
        />
        <div className="absolute inset-0 bg-brand-midnight/20 z-20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-brand-white z-30">
          <p className="mb-6 animate-fade-in text-[10px] font-bold uppercase tracking-[0.4em] md:text-xs">
            Ramos Glamour
          </p>
          <h1 className="heading-luxury mb-8 max-w-4xl animate-slide-up text-5xl font-light leading-[1.1] md:text-8xl">
            A Essência da <br /> <span className="italic font-serif">Elegância Feminina</span>
          </h1>
          <Link
            href="/catalogo"
            className="group flex items-center gap-4 border border-brand-white/30 bg-brand-white/10 px-8 py-4 text-xs font-semibold tracking-[0.2em] transition-all hover:bg-brand-white hover:text-brand-midnight"
          >
            DESCOBRE A COLEÇÃO
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-4">
            <span className="text-[9px] font-bold tracking-[0.3em] text-brand-white/60">SCROLL</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-brand-white/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Featured Categories (Editorial Layout) ───────────────────── */}
      {hasCategories && (
        <ScrollReveal className="w-full">
          <section className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-12">
            <div className="mb-16 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
                Coleções
              </p>
              <h2 className="heading-luxury mt-4 text-3xl font-light md:text-5xl">
                Categorias em <span className="italic">Destaque</span>
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {rootCategories.slice(0, 3).map((category, index) => {
                const productWithImage = featuredProducts.find((p) =>
                  p.categories.some((c) => c.slug === category.slug)
                );

                return (
                  <Link
                    key={category.id}
                    href={`/catalogo?categoria=${encodeURIComponent(category.slug)}`}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-700",
                      index === 1 ? "md:translate-y-12" : ""
                    )}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <Image
                        src={
                          productWithImage?.images[0]?.url ??
                          "https://picsum.photos/seed/cat-fallback/600/900"
                        }
                        alt={category.name}
                        fill
                        className="object-cover transition duration-1000 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-brand-midnight/10 transition-opacity group-hover:opacity-30" />
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="heading-luxury text-2xl font-light">{category.name}</h3>
                      <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-brand-midnight/40 transition-colors group-hover:text-brand-gold">
                        VER TUDO
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ── Featured Products ────────────────────────────────────────── */}
      <section className="bg-[#1A1A1A] py-24 text-brand-white">
        <ScrollReveal className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
          <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white/40">
                A Nossa Seleção
              </p>
              <h2 className="heading-luxury mt-4 text-3xl font-light md:text-5xl">
                O Novo <span className="italic">Luxo</span>
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="group flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-brand-white/60 transition-colors hover:text-brand-white"
            >
              EXPLORAR TUDO
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {hasProducts ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} inverseColors />
              ))}
            </div>
          ) : (
            <div className="border border-brand-white/10 bg-white/5 py-24 text-center">
              <p className="heading-luxury text-xl font-light italic opacity-40">
                Brevemente...
              </p>
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* ── Brand Statement ──────────────────────────────────────────── */}
      <section className="py-24 text-center">
        <ScrollReveal className="mx-auto max-w-3xl px-6">
          <p className="heading-luxury text-3xl font-light leading-relaxed md:text-5xl">
            &quot;A verdadeira elegância está no <span className="italic text-brand-gold">detalhe</span>, no toque de seda e na confiança de ser única.&quot;
          </p>
          <div className="mt-12 h-12 w-[1px] bg-brand-gold mx-auto" />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-midnight/60">
            Ramos Glamour — Desde 2024
          </p>
        </ScrollReveal>
      </section>
    </main>
  );
}

