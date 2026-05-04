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
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/shared/Animations";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <FadeUp>
        <PageHeader 
          title="Produtos" 
          actions={
            <Link
              href="/produtos/novo"
              className="hidden items-center justify-center rounded-xl bg-brand-midnight px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-white shadow-md transition hover:bg-brand-charcoal md:flex"
            >
              <Plus className="mr-2 h-5 w-5" />
              NOVO PRODUTO
            </Link>
          }
        />
      </FadeUp>

      <FadeUp delay={0.1}>
        <ProductFilters categories={flatCategories} />
      </FadeUp>

      {products.length ? (
        <StaggerContainer>
          <div className="rounded-xl border border-brand-midnight/5 bg-white shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-brand-bg/30 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
                  <tr className="border-b border-brand-midnight/5">
                    <th className="px-5 py-3 font-semibold">Imagem</th>
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="hidden px-5 py-3 font-semibold md:table-cell">Categoria</th>
                    <th className="px-5 py-3 font-semibold">Preço</th>
                    <th className="hidden px-5 py-3 font-semibold lg:table-cell">Estado</th>
                    <th className="hidden px-5 py-3 font-semibold xl:table-cell">Variações</th>
                    <th className="px-5 py-3 text-right font-semibold">Acções</th>
                  </tr>
                </thead>
                <StaggerContainer as="tbody" className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <StaggerItem
                      as="tr"
                      key={product.id} 
                      className="group hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-brand-bg/50 border border-brand-midnight/5 shadow-sm transition-transform group-hover:scale-105">
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
                      <td className="px-5 py-4 font-medium text-brand-midnight">
                        <div className="flex items-center gap-1.5 max-w-[150px] md:max-w-[200px]">
                          <span className="truncate" title={product.name}>{product.name}</span>
                          {product.is_featured ? (
                            <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold shrink-0" />
                          ) : null}
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 text-brand-midnight/60 md:table-cell">
                        <div className="max-w-[120px] truncate text-xs">
                          {product.categories?.length
                            ? product.categories.map((category) => category.name).join(", ")
                            : "Sem categoria"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-brand-midnight font-semibold">
                        {formatPrice(product.price)}
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          product.is_active ? "bg-emerald-50 text-emerald-600" : "bg-brand-midnight/5 text-brand-midnight/40"
                        )}>
                          {product.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-brand-midnight/40 xl:table-cell text-xs">
                        {product.product_variants?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap w-[1%]">
                        <ProductRowActions
                          productId={product.id}
                          isActive={product.is_active}
                          isFeatured={product.is_featured}
                        />
                      </td>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </table>
            </div>

            {/* Mobile List */}
            <StaggerContainer className="md:hidden divide-y divide-slate-100">
              {products.map((product) => (
                <StaggerItem key={product.id}>
                  <MobileCardRow
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
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <ProductPaginationWrapper
            totalCount={count}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
          />
        </StaggerContainer>
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

