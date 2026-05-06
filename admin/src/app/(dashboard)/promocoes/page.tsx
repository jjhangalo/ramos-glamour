import { getPromotedProducts } from "@/lib/actions/promotions";
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

  const { promotions, count } = await getPromotedProducts(currentPage, pageSize);


  return (
    <PromotionsClient
      promotions={promotions}
      totalCount={count}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}
