import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/products/ProductEditor";
import { getCategories } from "@/lib/actions/categories";
import { getProduct } from "@/lib/actions/products";

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
    return <ProductEditor product={null} categories={categories} />;
  }

  const product = await getProduct(id).catch(() => null);
  if (!product) {
    notFound();
  }

  return <ProductEditor product={product} categories={categories} />;
}
