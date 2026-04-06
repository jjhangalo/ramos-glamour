import { ProductCard } from "@/components/product/ProductCard";
import { mockCategories, mockProducts } from "@/lib/mock/products";

type CatalogPageProps = {
  searchParams?: Promise<{
    categoria?: string;
    ordem?: string;
  }>;
};

function sortProducts(ordem: string | undefined) {
  const items = [...mockProducts];

  if (ordem === "preco-asc") {
    return items.sort((a, b) => a.price - b.price);
  }

  if (ordem === "preco-desc") {
    return items.sort((a, b) => b.price - a.price);
  }

  return items.reverse();
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const categoria = params.categoria;
  const ordem = params.ordem;

  const filteredProducts = sortProducts(ordem).filter((product) => {
    if (!categoria || categoria === "todas") {
      return true;
    }

    return product.category.slug === categoria;
  });

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

          <form className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-brand-charcoal">
              <span>Categoria</span>
              <select
                name="categoria"
                defaultValue={categoria ?? "todas"}
                className="w-full rounded-full border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              >
                <option value="todas">Todas</option>
                {mockCategories.map((item) => (
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
                defaultValue={ordem ?? "recentes"}
                className="w-full rounded-full border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              >
                <option value="recentes">Mais recentes</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
              </select>
            </label>

            <button
              type="submit"
              className="sm:col-span-2 rounded-full bg-brand-olive px-5 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
            >
              Aplicar filtros
            </button>
          </form>
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] bg-white/80 px-6 py-16 text-center text-brand-charcoal shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
          Nenhum produto encontrado
        </section>
      )}
    </main>
  );
}
