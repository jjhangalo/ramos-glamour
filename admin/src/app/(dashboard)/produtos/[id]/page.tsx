import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/products/ProductEditor";
import { getCategories } from "@/lib/actions/categories";
import { getProduct } from "@/lib/actions/products";
import { getPromotionByProductId } from "@/lib/actions/promotions";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const categories = await getCategories();

  if (id === "novo") {
    return <ProductEditor product={null} categories={categories} initialPromotion={null} />;
  }

  const product = await getProduct(id).catch(() => null);
  if (!product) {
    notFound();
  }

  const promotion = await getPromotionByProductId(id).catch(() => null);

  return (
    <ProductEditor 
      product={product} 
      categories={categories} 
      initialPromotion={promotion}
    />
  );
}
