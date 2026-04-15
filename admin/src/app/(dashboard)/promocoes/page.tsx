import { getPromotedProducts } from "@/lib/actions/promotions";
import { getProducts } from "@/lib/actions/products";
import { PromotionsClient } from "./PromotionsClient";

export const metadata = {
  title: "Promoções | Ramos Glamour Admin",
  description: "Gestão de produtos em promoção.",
};

export default async function PromocoesPage() {
  const [promotions, products] = await Promise.all([
    getPromotedProducts(),
    getProducts(),
  ]);

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
  }));

  return <PromotionsClient promotions={promotions} products={productOptions} />;
}
