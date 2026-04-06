import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProductById, mockProducts } from "@/lib/mock/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetailView product={product} />
    </main>
  );
}
