import Image from "next/image";
import Link from "next/link";
import { Pencil, Star } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/format";
import { getCategories } from "@/lib/actions/categories";
import { getProducts } from "@/lib/actions/products";

type ProductsPageProps = {
  searchParams?: Promise<{
    categoria?: string;
    estado?: "all" | "active" | "inactive";
    pesquisa?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      category: params.categoria,
      status: params.estado,
      search: params.pesquisa,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Produtos
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Catálogo do painel
          </h1>
        </div>
        <Link
          href="/produtos/novo"
          className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Novo produto
        </Link>
      </div>

      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.2fr_220px_220px_auto]">
        <input
          type="search"
          name="pesquisa"
          defaultValue={params.pesquisa ?? ""}
          placeholder="Pesquisar por nome"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
        <select
          name="categoria"
          defaultValue={params.categoria ?? "all"}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          name="estado"
          defaultValue={params.estado ?? "all"}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">Todos os estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Filtrar
        </button>
      </form>

      {products.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">Imagem</th>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Categoria</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="hidden px-5 py-3 font-medium lg:table-cell">Estado</th>
                <th className="hidden px-5 py-3 font-medium xl:table-cell">Variações</th>
                <th className="px-5 py-3 font-medium text-right">Acções</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100">
                  <td className="px-5 py-4">
                    <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-slate-100 md:h-12 md:w-12">
                      {product.product_images?.[0]?.url ? (
                        <Image
                          src={product.product_images[0].url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 32px, 48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-950">
                    <div className="flex items-center gap-1.5 max-w-[150px] md:max-w-[200px]">
                      <span className="truncate" title={product.name}>{product.name}</span>
                      {product.is_featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                      ) : null}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 md:table-cell">
                    <div className="max-w-[120px] truncate">
                      {product.categories?.length
                        ? product.categories.map((category) => category.name).join(", ")
                        : "Sem categoria"}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 lg:table-cell">
                    {product.is_active ? "Activo" : "Inactivo"}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-700 xl:table-cell">
                    {product.product_variants?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/produtos/${product.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100"
                      title="Gerir produto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Ajusta os filtros ou cria um novo produto para começar."
          actionHref="/produtos/novo"
          actionLabel="Novo produto"
        />
      )}
    </div>
  );
}
