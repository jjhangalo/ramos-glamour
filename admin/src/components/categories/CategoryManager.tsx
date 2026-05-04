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
import { StickySaveBar } from "@/components/ui/StickySaveBar";

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
    formState: { dirtyFields, isDirty },
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
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <section className="h-fit rounded-xl border border-brand-midnight/5 bg-white p-6 shadow-sm focus-within:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-bg p-2 text-brand-midnight/60">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-brand-midnight">
              {isEditing ? "A actualizar detalhes..." : "Criar nova categoria raiz"}
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
                  <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Nome</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-brand-midnight/5 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
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
                  <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Slug</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-brand-midnight/5 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50"
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
                  <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Categoria pai</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value ?? ""}
                      className="w-full rounded-xl border border-brand-midnight/5 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 appearance-none"
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
              {!isDirty && (
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-brand-midnight px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-white shadow-sm transition hover:bg-brand-charcoal disabled:opacity-50"
                >
                  {isEditing ? "GUARDAR" : "CRIAR CATEGORIA"}
                </button>
              )}
              {isEditing && !isDirty && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-brand-midnight/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/70 transition hover:bg-brand-bg"
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </Form>
      </section>

      <StickySaveBar
        isDirty={isDirty}
        isSaving={isPending}
        onSave={handleSubmit(onSubmit)}
        onReset={resetForm}
      />

      <section className="rounded-xl border border-brand-midnight/5 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-brand-bg/50 border-b border-brand-midnight/5 px-5 py-4">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">Categorias</h2>
            <p className="mt-1 text-sm font-semibold text-brand-midnight">
              Estrutura do catálogo
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-midnight/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/70 shadow-sm transition hover:bg-brand-bg"
          >
            <Plus className="h-3.5 w-3.5" />
            NOVA RAIZ
          </button>
        </div>

        <div className="divide-y divide-brand-midnight/5">
          {categories.map((category) => (
            <div key={category.id} className="px-5 py-4 transition-colors hover:bg-brand-bg/30">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(category.id)}
                  className="group flex items-center gap-3 text-left"
                >
                  <div className="rounded-xl bg-brand-bg p-2 text-brand-midnight/40 transition-colors group-hover:bg-brand-midnight/5 group-hover:text-brand-midnight">
                    {expandedRootIds.includes(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-midnight">{category.name}</h3>
                    <p className="text-xs text-brand-midnight/40">/{category.slug}</p>
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
                      className="text-xs font-bold uppercase tracking-wider"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
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
                      className="text-xs font-bold uppercase tracking-wider"
                    >
                      <FolderTree className="mr-2 h-3.5 w-3.5" />
                      Subcategoria
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(category.id)}
                      className="text-xs font-bold uppercase tracking-wider text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenu>
                </div>
              </div>

              {expandedRootIds.includes(category.id) ? (
                <div className="mt-4 space-y-2 border-l-2 border-brand-midnight/5 pl-6">
                  {category.children?.length ? (
                    category.children.map((child) => (
                      <div
                        key={child.id}
                        className="group flex flex-col gap-3 rounded-xl border border-brand-midnight/5 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-brand-midnight/10 hover:shadow-md md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-brand-midnight">{child.name}</h4>
                          <p className="text-xs text-brand-midnight/40">/{child.slug}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                              className="text-xs font-bold uppercase tracking-wider"
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(child.id)}
                              className="text-xs font-bold uppercase tracking-wider text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-2 text-xs italic text-slate-400">
                      Nenhuma subcategoria configurada.
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
