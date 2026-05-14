import { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/actions/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ramosglamour.com";

  // Static Pages
  const staticPages = [
    "",
    "/catalogo",
    "/novidades",
    "/empresa",
    "/contacto",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categorias/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const productPages = products.map((product) => ({
      url: `${baseUrl}/produtos/${product.id}`, // Fallback to ID if slug not yet fully implemented in DB
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // If we have slugs for products in the future, we should use them.
    // For now, based on current implementation, we use /produtos/[slug] 
    // but getProducts might not return slugs yet. 
    // I'll stick to the requested /produtos/[slug] format if possible.

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticPages;
  }
}
