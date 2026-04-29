import Image from "next/image";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/format";
import { getCategories } from "@/lib/actions/categories";
import { getProducts } from "@/lib/actions/products";

import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductRowActions } from "@/components/products/ProductRowActions";

import { PageHeader } from "@/components/list/PageHeader";
import { MobileCardRow } from "@/components/list/MobileCardRow";
import { FAB } from "@/components/list/FAB";
import { ProductPaginationWrapper } from "@/components/products/ProductPaginationWrapper";

type ProductsPageProps = {
  searchParams?: Promise<{
    categoria?: string | string[];
    estado?: "all" | "active" | "inactive";
    destaque?: "all" | "true" | "false";
    pesquisa?: string;
    pagina?: string;
    limite?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = Number(params.pagina || "1");
  const pageSize = Number(params.limite || "20");

  const categoryIds = Array.isArray(params.categoria) 
    ? params.categoria 
    : params.categoria 
      ? [params.categoria] 
      : [];

  const categories = await getCategories();
  const flatCategories = categories.flatMap((c) => [
    { id: c.id, name: c.name },
    ...(c.children?.map((child: any) => ({ id: child.id, name: `↳ ${child.name}` })) || []),
  ]);

  const { products, count } = await getProducts({
    category_ids: categoryIds,
    status: params.estado,
    is_featured: params.destaque === "true" ? true : params.destaque === "false" ? false : undefined,
    search: params.pesquisa,
    page: currentPage,
    limit: pageSize,
  });

  const totalPages = Math.ceil(count / pageSize);

  return (
    <PageCanvas size="list" className="relative space-y-6 pb-32 pt-8">
      <PageHeader 
        title="Produtos" 
        actions={
          <Link
            href="/produtos/novo"
            className="hidden items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-slate-800 md:flex"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Produto
          </Link>
        }
      />

      <ProductFilters categories={flatCategories} />

      {products.length ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                        <ProductRowActions
                          productId={product.id}
                          isActive={product.is_active}
                          isFeatured={product.is_featured}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-slate-100">
              {products.map((product) => (
                <MobileCardRow
                  key={product.id}
                  thumbnail={
                    product.product_images?.[0]?.url ? (
                      <Image
                        src={product.product_images[0].url}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null
                  }
                  title={product.name}
                  isFeatured={product.is_featured}
                  subtitle={
                    product.categories?.length
                      ? product.categories.map((c) => c.name).join(", ")
                      : "Sem categoria"
                  }
                  meta={formatPrice(product.price)}
                  badge={
                    <span className={cn(
                      product.is_active ? "text-emerald-600" : "text-slate-400"
                    )}>
                      {product.is_active ? "Activo" : "Inactivo"}
                    </span>
                  }
                  actions={
                    <ProductRowActions
                      productId={product.id}
                      isActive={product.is_active}
                      isFeatured={product.is_featured}
                    />
                  }
                />
              ))}
            </div>
          </div>

          <ProductPaginationWrapper
            totalCount={count}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
          />
        </>
      ) : (
        <EmptyState
          title="Nenhum produto encontrado"
          description="Ajusta os filtros para recomeçar a tua pesquisa."
        />
      )}

      <FAB href="/produtos/novo" label="Novo Produto" />
    </PageCanvas>
  );
}

