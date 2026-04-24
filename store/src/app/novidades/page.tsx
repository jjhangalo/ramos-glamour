import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/actions/products";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default async function NovidadesPage() {
  // Fetch the latest 16 products
  const products = await getProducts({
    order: "newest",
    limit: 16,
  });

  const hasProducts = products.length > 0;

  return (
    <main className="flex flex-1 flex-col">
      {/* ── Editorial Header ────────────────────────────────────────── */}
      <section className="relative h-[60vh] w-full overflow-hidden bg-brand-midnight">
        <div className="absolute inset-0 opacity-40">
           <Image 
             src="/hero.png" // Reusing hero for now, but styled differently
             alt="Novidades Ramos Glamour"
             fill
             className="object-cover grayscale"
             priority
           />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-brand-white z-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">
            A NOVA TEMPORADA
          </p>
          <h1 className="heading-luxury text-5xl font-light md:text-8xl">
            Novidades
          </h1>
          <p className="mt-6 max-w-xl text-[11px] font-medium leading-relaxed tracking-widest text-brand-white/60 uppercase">
            A curadoria mais recente da Ramos Glamour. Peças que acabaram de chegar para transformar o seu guarda-roupa com o brilho da nova estação.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-brand-bg to-transparent" />
      </section>

      {/* ── Product Grid ───────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-24 lg:px-12">
        <div className="mb-16 flex flex-col items-center justify-between gap-6 border-b border-brand-midnight/5 pb-12 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
              Recém Chegados
            </p>
            <h2 className="heading-luxury mt-2 text-3xl font-light md:text-5xl">
              Últimos <span className="italic">Lançamentos</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-brand-midnight/30">
            {products.length} PRODUTOS
          </p>
        </div>

        {hasProducts ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="heading-luxury text-2xl font-light italic opacity-30">
              Novas peças a chegar em breve...
            </p>
          </div>
        )}

        {/* ── Collection Call-to-Action ───────────────────────────────── */}
        <div className="mt-32 border-t border-brand-midnight/5 pt-24 text-center">
           <h3 className="heading-luxury text-3xl font-light mb-8 md:text-5xl">
             Explore todas as <span className="italic">Coleções</span>
           </h3>
           <Link
             href="/catalogo"
             className="group inline-flex items-center gap-4 bg-brand-midnight px-10 py-5 text-[10px] font-bold tracking-[0.3em] text-brand-white transition-all hover:bg-brand-gold"
           >
             VER CATÁLOGO COMPLETO
             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
      </section>
    </main>
  );
}
