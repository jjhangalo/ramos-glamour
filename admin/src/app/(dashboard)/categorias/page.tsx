import { CategoryManager } from "@/components/categories/CategoryManager";
import { PageCanvas } from "@/components/ui/page-canvas";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
          Categorias
        </p>
        <h1 className="heading-luxury mt-2 text-4xl font-light text-brand-midnight">
          Gestão de Categorias
        </h1>
      </div>
      <CategoryManager categories={categories} />
    </PageCanvas>
  );
}
