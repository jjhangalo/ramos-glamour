"use client";

import { useState, useEffect } from "react";
import { StickySaveBar } from "@/components/ui/StickySaveBar";
import { cn } from "@/lib/utils";
import type { ProductRecord, CategoryRecord } from "@/lib/types";

const sections = [
  { id: "geral", label: "Informação Geral" },
  { id: "preco", label: "Preço & Stock" },
  { id: "organizacao", label: "Organização" },
  { id: "imagens", label: "Imagens" },
  { id: "variantes", label: "Variantes" },
];

type ProductFormProps = {
  product: ProductRecord;
  categories: CategoryRecord[];
  onSave: (data: Partial<ProductRecord>) => Promise<void>;
};

export function ProductForm({ product, categories, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<ProductRecord>>(product);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [activeSection, setActiveSection] = useState("geral");

  const handleFieldChange = (field: keyof ProductRecord, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsDirty(false);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(product);
    setIsDirty(false);
  };

  // Scroll spy for side nav
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative grid gap-12 lg:grid-cols-[240px_1fr]">
      {/* Sticky Side Nav */}
      <aside className="hidden lg:block">
        <nav className="sticky top-32 flex flex-col gap-1">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                activeSection === section.id
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Form Content */}
      <div className="space-y-12 pb-32">
        {/* Geral */}
        <section id="geral" className="scroll-mt-32 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Informação Geral</h2>
            <p className="text-sm text-slate-500">Nome e descrição pública do produto.</p>
          </div>
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Produto</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descrição</label>
              <textarea
                rows={5}
                value={formData.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Preço & Stock */}
        <section id="preco" className="scroll-mt-32 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Preço & Stock</h2>
            <p className="text-sm text-slate-500">Valores base de comercialização.</p>
          </div>
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Base (KZ)</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Total</label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Organização */}
        <section id="organizacao" className="scroll-mt-32 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Organização</h2>
            <p className="text-sm text-slate-500">Categorização e visibilidade.</p>
          </div>
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categoria Principal</label>
              <select
                value={formData.category_id || ""}
                onChange={(e) => handleFieldChange("category_id", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleFieldChange("is_active", e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Produto Activo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleFieldChange("is_featured", e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Destaque na Home</span>
              </label>
            </div>
          </div>
        </section>

        {/* Placeholder for Images and Variants */}
        <section id="imagens" className="scroll-mt-32 space-y-6 opacity-50">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Imagens</h2>
            <p className="text-sm text-slate-500">Gestão de media (Em breve).</p>
          </div>
        </section>

        <section id="variantes" className="scroll-mt-32 space-y-6 opacity-50">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Variantes</h2>
            <p className="text-sm text-slate-500">Tamanhos e cores (Em breve).</p>
          </div>
        </section>
      </div>

      <StickySaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
        lastSaved={lastSaved}
      />
    </div>
  );
}
