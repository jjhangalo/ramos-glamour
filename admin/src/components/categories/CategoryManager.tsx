"use client";

import { ChevronDown, ChevronRight, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import { slugify } from "@/lib/format";
import type { CategoryRecord } from "@/lib/types";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type CategoryManagerProps = {
  categories: CategoryRecord[];
};

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  parent_id: "",
};

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [expandedRootIds, setExpandedRootIds] = useState<string[]>(
    categories.map((category) => category.id),
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { dirtyFields },
  } = form;

  const nameValue = useWatch({ control, name: "name" });
  const formId = useWatch({ control, name: "id" });
  const isEditing = Boolean(formId);

  useEffect(() => {
    if (nameValue && !dirtyFields.slug) {
      setValue("slug", slugify(nameValue), {
        shouldValidate: true,
      });
    }
  }, [nameValue, dirtyFields.slug, setValue]);

  function resetForm() {
    reset(defaultValues);
  }

  function toggleExpanded(id: string) {
    setExpandedRootIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  const onSubmit = (data: CategoryFormValues) => {
    startTransition(async () => {
      const payload = {
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id || null,
      };
      const result = data.id
        ? await updateCategory(data.id, payload)
        : await createCategory(payload);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível guardar a categoria.");
        return;
      }

      toast.success(
        data.id ? "Categoria actualizada." : "Categoria criada com sucesso.",
      );
      resetForm();
    });
  };

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível remover a categoria.");
        return;
      }

      toast.success("Categoria removida.");
      if (formId === id) {
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

        <Form {...form}>
          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                      placeholder="Ex.: Vestidos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                      placeholder="vestidos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria pai</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value ?? ""}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
                    >
                      <option value="">Nenhuma (categoria raiz)</option>
                      {categories
                        .filter((category) => category.id !== formId)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
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
                      onClick={() => {
                        reset({
                          id: category.id,
                          name: category.name,
                          slug: category.slug,
                          parent_id: category.parent_id ?? "",
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        reset({
                          name: "",
                          slug: "",
                          parent_id: category.id,
                        });
                      }}
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
                              onClick={() => {
                                reset({
                                  id: child.id,
                                  name: child.name,
                                  slug: child.slug,
                                  parent_id: child.parent_id ?? "",
                                });
                              }}
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
