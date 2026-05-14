import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product/ProductDetailView";
import { getProductBySlug } from "@/lib/actions/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Ramos Glamour",
    };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `Descubra ${product.name} na Ramos Glamour. Moda feminina de luxo e elegância em Luanda.`;

  return {
    title: product.name,
    description: description,
    openGraph: {
      title: product.name,
      description: description,
      type: "website",
      images: product.images?.[0]?.url ? [
        {
          url: product.images[0].url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetailView product={product} />
    </main>
  );
}
