import { CategoryManager } from "@/components/categories/CategoryManager";
import { PageCanvas } from "@/components/ui/page-canvas";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Categorias
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Gestão de categorias
        </h1>
      </div>
      <CategoryManager categories={categories} />
    </PageCanvas>
  );
}
