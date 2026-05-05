import { getPromotedProducts } from "@/lib/actions/promotions";
import { getProducts } from "@/lib/actions/products";
import { PromotionsClient } from "./PromotionsClient";

export const metadata = {
  title: "Promoções | Ramos Glamour Admin",
  description: "Gestão de produtos em promoção.",
};

type PromocoesPageProps = {
  searchParams?: Promise<{
    pagina?: string;
    limite?: string;
  }>;
};

export default async function PromocoesPage({ searchParams }: PromocoesPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = Number(params.pagina || "1");
  const pageSize = Number(params.limite || "20");

  const [{ promotions, count }, { products }] = await Promise.all([
    getPromotedProducts(currentPage, pageSize),
    getProducts(), // We might need to paginate this later, but for now we'll keep it as is for the select dialog. Or maybe the dialog should have a proper search endpoint, but that's a different task.
  ]);

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    variants: p.product_variants?.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      price_override: v.price_override,
    })) || [],
  }));

  return (
    <PromotionsClient
      promotions={promotions}
      products={productOptions}
      totalCount={count}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}
