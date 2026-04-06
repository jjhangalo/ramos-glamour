import { CategoryManager } from "@/components/categories/CategoryManager";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Categorias
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Gestão de categorias
        </h1>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
