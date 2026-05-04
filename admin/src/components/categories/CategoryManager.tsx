"use client";

import { 
  ChevronDown, 
  ChevronRight, 
  FolderTree, 
  Pencil, 
  Plus, 
  Trash2,
  HelpCircle,
  Layers,
  LayoutGrid,
  ArrowRight,
  FolderPlus
} from "lucide-react";
import { useEffect, useState, useTransition, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import { slugify } from "@/lib/format";
import type { CategoryRecord } from "@/lib/types";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/shared/Animations";
import { cn } from "@/lib/utils";
import { FAB } from "@/components/list/FAB";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [expandedIds, setExpandedIds] = useState<string[]>(
    categories.map((c) => c.id)
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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
    setIsSheetOpen(false);
  }

  function openNewForm() {
    reset(defaultValues);
    setIsSheetOpen(true);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) =>
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
    if (!confirm("Tens a certeza que desejas remover esta categoria?")) return;

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

  function handleEdit(c: CategoryRecord) {
    reset({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent_id ?? "",
    });
    setIsSheetOpen(true);
  }

  function handleAddSub(parentId: string) {
    reset({
      name: "",
      slug: "",
      parent_id: parentId,
    });
    setIsSheetOpen(true);
  }

  // Flattened categories for the parent selection dropdown
  const flatCategories = useMemo(() => {
    const list: Array<{ id: string; name: string; level: number }> = [];
    function flatten(items: CategoryRecord[], level = 0) {
      items.forEach((item) => {
        list.push({ id: item.id, name: item.name, level });
        if (item.children?.length) {
          flatten(item.children, level + 1);
        }
      });
    }
    flatten(categories);
    return list;
  }, [categories]);

  return (
    <div className="space-y-12">
      {/* Header with Help Trigger */}
      <FadeUp>
        <div className="border-b border-brand-midnight/5 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">Estrutura do Catálogo</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-brand-midnight/10 bg-white transition-all hover:border-brand-gold/50 hover:bg-brand-gold/5">
                  <HelpCircle className="h-5 w-5 text-brand-midnight/40 transition-colors group-hover:text-brand-gold" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-gold text-[8px] font-bold text-white">?</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="heading-luxury text-2xl font-light">Gestão de Categorias</DialogTitle>
                </DialogHeader>
                <div className="mt-6 space-y-8 pb-4">
                  <p className="text-sm text-brand-midnight/60 leading-relaxed">
                    As categorias organizam os teus produtos no catálogo. Podes criar estruturas hierárquicas para facilitar a navegação.
                  </p>
                  
                  <div className="grid gap-6">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg text-brand-midnight">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-midnight">Raiz (Principal)</h4>
                        <p className="mt-1 text-xs text-brand-midnight/50">Aparecem diretamente no menu de navegação da loja.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg text-brand-midnight">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-midnight">Subcategorias</h4>
                        <p className="mt-1 text-xs text-brand-midnight/50">Filhas de uma raiz (ex: Vestidos {" > "} Curtos).</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg text-brand-midnight">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-midnight">Efeito Cascata</h4>
                        <p className="mt-1 text-xs text-brand-midnight/50">Eliminar uma categoria raiz pode afetar a visibilidade das filhas.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <p className="mt-4 text-2xl font-light text-brand-midnight">
            {categories.length} Categorias Principais
          </p>
        </div>
      </FadeUp>

      {/* Main List Section */}
      <StaggerContainer className="space-y-4">
        {categories.map((category) => (
          <CategoryItem 
            key={category.id} 
            category={category} 
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
            onEdit={handleEdit}
            onAddSub={handleAddSub}
            onDelete={handleDelete}
          />
        ))}

        {categories.length === 0 && (
          <FadeUp>
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-midnight/5 bg-white/50 p-24 text-center">
              <div className="rounded-full bg-brand-bg p-6 text-brand-midnight/10">
                <FolderPlus className="h-12 w-12" />
              </div>
              <h3 className="mt-6 text-lg font-light text-brand-midnight">O teu catálogo está vazio</h3>
              <p className="mt-2 text-sm text-brand-midnight/40 max-w-xs">Cria a tua primeira categoria principal para começar a organizar os produtos.</p>
              <button 
                onClick={openNewForm}
                className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold hover:underline"
              >
                CRIAR AGORA
              </button>
            </div>
          </FadeUp>
        )}
      </StaggerContainer>

      {/* FAB (#25) */}
      <FAB onClick={openNewForm} label="Nova Categoria" />

      {/* Dynamic Form Sheet (#25) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 border-l-brand-midnight/5">
          <div className="flex h-full flex-col bg-white">
            <SheetHeader className="p-8 border-b border-brand-midnight/5 bg-brand-bg/10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors shadow-sm",
                  isEditing ? "bg-brand-gold text-white" : "bg-brand-midnight text-white"
                )}>
                  {isEditing ? <Pencil className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </div>
                <div>
                  <SheetTitle className="heading-luxury text-2xl font-light">
                    {isEditing ? "Editar Categoria" : "Nova Categoria"}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-medium uppercase tracking-widest text-brand-midnight/30 mt-1">
                    {isEditing ? `ID: ${formId}` : "Configuração de entrada"}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-8" ref={formRef}>
              <Form {...form}>
                <form className="space-y-8" id="category-form" onSubmit={handleSubmit(onSubmit)}>
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1">Nome</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            className="w-full rounded-2xl border border-brand-midnight/10 bg-brand-bg/20 px-5 py-4 text-sm outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-1 focus:ring-brand-gold/50"
                            placeholder="Ex.: Vestidos de Festa"
                            autoFocus
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
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1">Slug (URL)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs text-brand-midnight/30">/</span>
                            <input
                              {...field}
                              className="w-full rounded-2xl border border-brand-midnight/10 bg-brand-bg/20 pl-8 pr-5 py-4 text-sm outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-1 focus:ring-brand-gold/50 font-mono"
                              placeholder="vestidos-festa"
                            />
                          </div>
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
                        <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1">Posicionamento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <select
                              {...field}
                              value={field.value ?? ""}
                              className="w-full rounded-2xl border border-brand-midnight/10 bg-brand-bg/20 px-5 py-4 text-sm outline-none transition focus:border-brand-gold/50 focus:bg-white focus:ring-1 focus:ring-brand-gold/50 appearance-none cursor-pointer"
                            >
                              <option value="">Categoria Raiz (Menu Principal)</option>
                              {flatCategories
                                .filter((c) => c.id !== formId)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {"\u00A0".repeat(c.level * 4)}
                                    {c.level > 0 ? "└─ " : ""}
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-midnight/30 pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            <div className="p-8 border-t border-brand-midnight/5 bg-brand-bg/5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1 rounded-xl border border-brand-midnight/10 py-4 text-[10px] font-bold uppercase tracking-widest text-brand-midnight/60 transition hover:bg-white active:scale-95"
              >
                Cancelar
              </button>
              <button
                form="category-form"
                type="submit"
                disabled={isPending}
                className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-brand-midnight py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white shadow-lg shadow-brand-midnight/20 transition hover:bg-brand-charcoal active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-white/20 border-t-brand-white" />
                ) : (
                  <>
                    {isEditing ? "Guardar" : "Criar"}
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <StickySaveBar
        isDirty={isDirty}
        isSaving={isPending}
        onSave={handleSubmit(onSubmit)}
        onReset={resetForm}
      />
    </div>
  );
}

// Recursive Category Item Component
function CategoryItem({ 
  category, 
  level = 0,
  expandedIds,
  onToggle,
  onEdit,
  onAddSub,
  onDelete
}: { 
  category: CategoryRecord; 
  level?: number;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onEdit: (category: CategoryRecord) => void;
  onAddSub: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  const isExpanded = expandedIds.includes(category.id);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <StaggerItem className="group">
      <div className={cn(
        "relative rounded-3xl border bg-white transition-all duration-300",
        level === 0 ? "border-brand-midnight/5 shadow-sm hover:shadow-xl hover:shadow-brand-midnight/5" : "border-transparent hover:bg-brand-bg/40"
      )}>
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-5 min-w-0">
            {hasChildren ? (
              <button 
                onClick={() => onToggle(category.id)}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  isExpanded ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-bg text-brand-midnight/40 hover:bg-brand-midnight/5"
                )}
              >
                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-midnight/10" />
              </div>
            )}
            
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium text-brand-midnight">{category.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-brand-midnight/30 font-medium uppercase tracking-widest">/{category.slug}</span>
                {hasChildren && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-brand-midnight/10" />
                    <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">{category.children?.length} sub</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onAddSub(category.id)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-midnight/40 transition-colors hover:bg-brand-bg hover:text-brand-midnight"
              title="Nova subcategoria"
            >
              <FolderPlus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(category) }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-midnight/40 transition-colors hover:bg-brand-bg hover:text-brand-midnight"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-red-300 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Remover"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="px-6 pb-6 pt-0">
            <div className="space-y-1 border-l border-brand-midnight/10 ml-5 sm:ml-11">
              {category.children?.map((child) => (
                <CategoryItem 
                  key={child.id} 
                  category={child} 
                  level={level + 1}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onAddSub={onAddSub}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </StaggerItem>
  );
}

