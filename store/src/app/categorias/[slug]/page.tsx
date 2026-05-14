import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { ProductCard } from "@/components/product/ProductCard";
import { CatalogFilters } from "@/components/product/CatalogFilters";
import { getCategories, getProducts, getCategoryBySlug } from "@/lib/actions/products";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    ordem?: string;
    page?: string;
    busca?: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada | Ramos Glamour",
    };
  }

  const title = `${category.name} | Ramos Glamour`;
  const description = `Explore a nossa coleção exclusiva de ${category.name} na Ramos Glamour. Moda feminina de luxo, elegância e sofisticação em Luanda.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CategoryPage({ 
  params, 
  searchParams 
}: CategoryPageProps) {
  const { slug } = await params;
  const sParams = (await searchParams) ?? {};
  
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const busca = sParams.busca;
  const page = sParams.page ? parseInt(sParams.page) : 1;
  const limit = 12;

  let order: "newest" | "price-asc" | "price-desc" = "newest";
  if (sParams.ordem === "preco-asc") order = "price-asc";
  if (sParams.ordem === "preco-desc") order = "price-desc";

  const products = await getProducts({
    categorySlug: slug,
    order,
    limit,
    search: busca,
  });

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-white border-b border-brand-midnight/5 py-12 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold mb-4">
              COLEÇÕES
            </p>
            <h1 className="heading-luxury text-4xl font-light md:text-7xl">
              {category.name}
            </h1>
            <p className="mt-6 max-w-xl text-[11px] font-medium leading-relaxed tracking-widest text-brand-midnight/40 uppercase">
              Explore a nossa coleção de {category.name} na Ramos Glamour. Curadoria exclusiva para elevar a sua essência.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-12 px-6 py-12 lg:flex-row lg:px-12 lg:py-20">
        <CatalogFilters 
          categories={allCategories}
          activeCategory={slug}
          activeOrder={sParams.ordem}
          activeSearch={busca}
          totalProducts={products.length}
        />

        <div className="flex-1 space-y-16">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-3">
                {products.map((product, index) => (
                  <div 
                    key={product.id}
                    className={cn(
                      "animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                      index < 9 && `stagger-${(index % 5) + 1}`
                    )}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-8 pt-12 border-t border-brand-midnight/5">
                {page > 1 ? (
                  <Link
                    href={`/categorias/${slug}?page=${page - 1}${busca ? `&busca=${busca}` : ""}${sParams.ordem ? `&ordem=${sParams.ordem}` : ""}`}
                    className="text-[10px] font-bold tracking-[0.3em] text-brand-midnight/40 hover:text-brand-midnight"
                  >
                    ANTERIOR
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold tracking-[0.3em] opacity-10 cursor-not-allowed">ANTERIOR</span>
                )}
                
                <span className="text-[11px] font-semibold tracking-widest text-brand-gold">
                   {page.toString().padStart(2, '0')}
                </span>

                {products.length === limit ? (
                  <Link
                    href={`/categorias/${slug}?page=${page + 1}${busca ? `&busca=${busca}` : ""}${sParams.ordem ? `&ordem=${sParams.ordem}` : ""}`}
                    className="text-[10px] font-bold tracking-[0.3em] text-brand-midnight/40 hover:text-brand-midnight"
                  >
                    PRÓXIMO
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold tracking-[0.3em] opacity-10 cursor-not-allowed">PRÓXIMO</span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="heading-luxury text-2xl font-light italic opacity-30 mb-6">
                Nenhuma peça encontrada nesta categoria...
              </p>
              <Link 
                href="/catalogo"
                className="text-[10px] font-bold tracking-[0.3em] border-b border-brand-midnight/20 pb-1 hover:border-brand-gold transition-colors"
              >
                VER TODAS AS PEÇAS
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
