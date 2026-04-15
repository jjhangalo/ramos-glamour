import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getPublicCategories } from "@/lib/actions/public-categories";
import { getPublicProducts } from "@/lib/actions/public-products";

type CatalogPageProps = {
  searchParams?: Promise<{
    categoria?: string;
    ordem?: string;
    page?: string;
    busca?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const categoria = params.categoria;
  const busca = params.busca;
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 16;

  const [products, categories] = await Promise.all([
    getPublicProducts({
      categorySlug: categoria,
      search: busca,
      page,
      limit,
    }),
    getPublicCategories(),
  ]);

  // Sorting is done in JS for now as the action only supports basic ordering
  // but I can add more sorting options to the action if needed.
  const sortedProducts = [...products];
  if (params.ordem === "preco-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (params.ordem === "preco-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/70">
          Catálogo
        </p>
        <div className="flex flex-col gap-4 rounded-[2rem] bg-white/75 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)] md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-brand-charcoal">
              Explora todas as peças
            </h1>
            <p className="mt-2 text-base text-brand-charcoal/75">
              Filtra por categoria e organiza os produtos como preferires.
            </p>
          </div>

            <div className="flex flex-col gap-4">
              <label className="space-y-2 text-sm text-brand-charcoal">
                <span>Pesquisar</span>
                <input
                  name="busca"
                  type="text"
                  defaultValue={busca ?? ""}
                  placeholder="Nome do produto..."
                  className="w-full rounded-full border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
                />
              </label>

              <form className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-brand-charcoal">
                  <span>Categoria</span>
                  <select
                    name="categoria"
                    defaultValue={categoria ?? "todas"}
                    className="w-full rounded-full border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
                  >
                    <option value="todas">Todas</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-brand-charcoal">
                  <span>Ordenação</span>
                  <select
                    name="ordem"
                    defaultValue={params.ordem ?? "recentes"}
                    className="w-full rounded-full border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="preco-asc">Menor preço</option>
                    <option value="preco-desc">Maior preço</option>
                  </select>
                </label>

                <div className="flex gap-2 sm:col-span-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-brand-olive px-5 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
                  >
                    Aplicar filtros
                  </button>
                  {params.busca || params.categoria || params.ordem ? (
                    <Link
                      href="/catalogo"
                      className="rounded-full bg-brand-charcoal/5 px-5 py-3 text-sm font-medium text-brand-charcoal transition hover:bg-brand-charcoal/10"
                    >
                      Limpar
                    </Link>
                  ) : null}
                </div>
              </form>
          </div>
        </div>
      </section>

      {sortedProducts.length > 0 ? (
        <div className="space-y-10">
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          {/* Simple Pagination */}
          <section className="flex items-center justify-center gap-4">
            {page > 1 && (
              <Link
                href={`/catalogo?page=${page - 1}${categoria ? `&categoria=${categoria}` : ""}${busca ? `&busca=${busca}` : ""}${params.ordem ? `&ordem=${params.ordem}` : ""}`}
                className="rounded-full border border-brand-charcoal/15 px-6 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-charcoal/5"
              >
                Anterior
              </Link>
            )}
            <span className="text-sm font-medium text-brand-charcoal">
              Página {page}
            </span>
            {sortedProducts.length === limit && (
              <Link
                href={`/catalogo?page=${page + 1}${categoria ? `&categoria=${categoria}` : ""}${busca ? `&busca=${busca}` : ""}${params.ordem ? `&ordem=${params.ordem}` : ""}`}
                className="rounded-full border border-brand-charcoal/15 px-6 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-charcoal/5"
              >
                Próxima
              </Link>
            )}
          </section>
        </div>
      ) : (
        <section className="rounded-[2rem] bg-white/80 px-6 py-16 text-center text-brand-charcoal shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
          Nenhum produto encontrado
        </section>
      )}
    </main>
  );
}
