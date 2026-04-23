import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProduct } from "@/lib/actions/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetailView product={product} />
    </main>
  );
}
