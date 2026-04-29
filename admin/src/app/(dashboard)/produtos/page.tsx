import Image from "next/image";
import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/format";
import { getCategories } from "@/lib/actions/categories";
import { getProducts } from "@/lib/actions/products";

import { ProductFilters } from "@/components/products/ProductFilters";

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
    <PageCanvas size="list" className="space-y-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Produtos
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Catálogo do painel
          </h1>
        </div>
        <Link
          href="/produtos/novo"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-800"
        >
          Novo produto
        </Link>
      </div>

      <ProductFilters categories={categories} params={params} />

      {products.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3">Imagem</th>
                <th className="px-5 py-3">Nome</th>
                <th className="hidden px-5 py-3 md:table-cell">Categoria</th>
                <th className="px-5 py-3">Preço</th>
                <th className="hidden px-5 py-3 lg:table-cell">Estado</th>
                <th className="hidden px-5 py-3 xl:table-cell">Variações</th>
                <th className="px-5 py-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100 border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                      {product.product_images?.[0]?.url ? (
                        <Image
                          src={product.product_images[0].url}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-950">
                    <div className="flex items-center gap-1.5 max-w-[150px] md:max-w-[200px]">
                      <span className="truncate" title={product.name}>{product.name}</span>
                      {product.is_featured ? (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      ) : null}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-600 md:table-cell">
                    <div className="max-w-[120px] truncate text-xs">
                      {product.categories?.length
                        ? product.categories.map((category) => category.name).join(", ")
                        : "Sem categoria"}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 font-semibold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {product.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-slate-500 xl:table-cell text-xs">
                    {product.product_variants?.length ?? 0}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                    <Link
                      href={`/produtos/${product.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-900 hover:text-slate-900"
                      title="Gerir produto"
                    >
                      <Pencil className="h-3.5 w-3.5" />
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
    </PageCanvas>
  );
}
