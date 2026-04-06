import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/ProductCard";
import { mockCategories, mockProducts } from "@/lib/mock/products";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
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
            {mockProducts.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className={`relative overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(98,98,96,0.12)] ${
                  index % 2 === 0 ? "translate-y-0 sm:translate-y-8" : ""
                }`}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={product.images[0].url}
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

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
              Categorias
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-brand-charcoal">
              Categorias em destaque
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {mockCategories.map((category, index) => {
            const product = mockProducts.find(
              (item) => item.category.slug === category.slug,
            );

            if (!product) {
              return null;
            }

            return (
              <Link
                key={category.id}
                href={`/catalogo?categoria=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(98,98,96,0.12)]"
              >
                <div className="relative aspect-[5/6]">
                  <Image
                    src={product.images[index % product.images.length].url}
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

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
              Seleção
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-brand-charcoal">
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {mockProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
