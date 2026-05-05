import { getProducts } from "@/lib/actions/products";
import { PromotionFormClient } from "./PromotionFormClient";

export const metadata = {
  title: "Nova Promoção | Ramos Glamour Admin",
  description: "Criar uma nova promoção para produtos ou variantes.",
};

export default async function NovaPromocaoPage() {
  const { products } = await getProducts();

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
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="heading-luxury text-3xl font-light text-brand-midnight">
          Nova Promoção
        </h1>
        <p className="mt-2 text-sm text-brand-midnight/60">
          Crie uma campanha promocional global ou focada em variantes específicas de stock.
        </p>
      </div>

      <PromotionFormClient products={productOptions} />
    </div>
  );
}
