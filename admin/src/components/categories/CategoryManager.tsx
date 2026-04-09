"use client";

import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories";
import { slugify } from "@/lib/format";
import type { CategoryRecord } from "@/lib/types";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type CategoryManagerProps = {
  categories: CategoryRecord[];
};

type FormState = {
  id?: string;
  name: string;
  slug: string;
  parent_id: string;
};

const initialState: FormState = {
  name: "",
  slug: "",
  parent_id: "",
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [expandedRootIds, setExpandedRootIds] = useState<string[]>(
    categories.map((category) => category.id),
  );

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  function resetForm() {
    setForm(initialState);
  }

  function toggleExpanded(id: string) {
    setExpandedRootIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id || null,
      };
      const result = isEditing
        ? await updateCategory(form.id!, payload)
        : await createCategory(payload);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível guardar a categoria.");
        return;
      }

      toast.success(
        isEditing ? "Categoria actualizada." : "Categoria criada com sucesso.",
      );
      resetForm();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível remover a categoria.");
        return;
      }

      toast.success("Categoria removida.");
      if (form.id === id) {
        resetForm();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </h2>
            <p className="text-sm text-slate-500">
              Cria categorias raiz ou subcategorias de primeiro nível.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                  slug: current.slug ? current.slug : slugify(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              placeholder="Ex.: Vestidos"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: slugify(event.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              placeholder="vestidos"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Categoria pai
            </label>
            <select
              value={form.parent_id}
              onChange={(event) =>
                setForm({ ...form, parent_id: event.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
            >
              <option value="">Nenhuma (categoria raiz)</option>
              {categories
                .filter((category) => category.id !== form.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing ? "Guardar alterações" : "Criar categoria"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {isEditing ? "Cancelar" : "Limpar"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Categorias</h2>
            <p className="text-sm text-slate-500">
              Estrutura raiz/subcategoria com um único nível de profundidade.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Nova categoria
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.map((category) => (
            <div key={category.id} className="px-5 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(category.id)}
                  className="flex items-center gap-3 text-left"
                >
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    {expandedRootIds.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-950">{category.name}</h3>
                    <p className="text-sm text-slate-500">{category.slug}</p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuItem
                      onClick={() =>
                        setForm({
                          id: category.id,
                          name: category.name,
                          slug: category.slug,
                          parent_id: category.parent_id ?? "",
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setForm({
                          name: "",
                          slug: "",
                          parent_id: category.id,
                        })
                      }
                    >
                      <FolderTree className="h-4 w-4" />
                      Adicionar subcategoria
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(category.id)}
                      className="text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>

              {expandedRootIds.includes(category.id) ? (
                <div className="mt-4 space-y-3 border-l border-slate-200 pl-6">
                  {category.children?.length ? (
                    category.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-slate-900">{child.name}</h4>
                          <p className="text-sm text-slate-500">{child.slug}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuItem
                              onClick={() =>
                                setForm({
                                  id: child.id,
                                  name: child.name,
                                  slug: child.slug,
                                  parent_id: child.parent_id ?? "",
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(child.id)}
                              className="text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Esta categoria raiz ainda não tem subcategorias.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
