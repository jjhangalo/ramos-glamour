"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

import { signInWithGoogle } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils/format";

export function CartPageClient() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(Boolean(data.user));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] animate-pulse">CARREGANDO...</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-8 h-20 w-20 rounded-full bg-brand-gold/5 flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-brand-gold/40" strokeWidth={1} />
        </div>
        <h2 className="heading-luxury text-3xl font-light mb-4">O seu carrinho está vazio</h2>
        <p className="text-[11px] font-medium tracking-widest text-brand-midnight/40 uppercase mb-8">
          DESCUBRA AS NOSSAS ÚLTIMAS COLECÇÕES E ENCONTRE A PEÇA PERFEITA.
        </p>
        <Link
          href="/catalogo"
          className="group flex items-center gap-4 bg-brand-midnight px-8 py-4 text-[10px] font-bold tracking-[0.3em] text-brand-white transition-all hover:bg-brand-gold"
        >
          EXPLORAR CATÁLOGO
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-20 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Items List */}
      <div className="space-y-12">
        {items.map((item) => (
          <article
            key={item.itemKey}
            className="group flex gap-8 border-b border-brand-midnight/5 pb-12 last:border-0"
          >
            {/* Portrait Thumbnail */}
            <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden bg-brand-midnight/5 md:w-32">
              <Image
                src={item.image}
                alt={item.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 128px"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-brand-gold mb-2 uppercase">
                    RAMOS GLAMOUR
                  </p>
                  <h2 className="heading-luxury text-xl font-light md:text-2xl">
                    {item.displayName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.itemKey)}
                  className="p-4 text-brand-midnight/20 hover:text-red-600 transition-all active:scale-95 touch-manipulation"
                  aria-label="Remover item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex items-end justify-between">
                {/* Quantity Controller */}
                <div className="flex items-center border border-brand-midnight/10 bg-brand-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                    className="p-5 transition-colors hover:bg-brand-midnight/5 active:bg-brand-midnight/10 touch-manipulation"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                    className="p-5 transition-colors hover:bg-brand-midnight/5 active:bg-brand-midnight/10 touch-manipulation"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="font-sans text-sm font-medium tracking-widest">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Summary Sidebar */}
      <aside className="lg:sticky lg:top-32 h-fit space-y-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">RESUMO DA ENCOMENDA</h3>
          
          <div className="space-y-4 border-y border-brand-midnight/5 py-8">
            <div className="flex items-center justify-between text-[11px] font-medium tracking-widest text-brand-midnight/60">
              <span>SUBTOTAL ({totalItems} ITENS)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium tracking-widest text-brand-midnight/60">
              <span>ENVIO ESTIMADO</span>
              <span className="text-brand-gold">GRÁTIS</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.2em]">TOTAL</span>
            <span className="text-2xl font-sans font-medium tracking-widest">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="space-y-4 pt-10 border-t border-brand-midnight/5">
           <p className="text-[10px] text-brand-midnight/40 leading-relaxed italic">
             * Ao finalizar a sua encomenda, concorda com os nossos Termos e Condições de venda.
           </p>
           
           <button
             type="button"
             onClick={() => isAuthenticated ? router.push("/checkout") : signInWithGoogle("/checkout")}
             className="w-full bg-brand-gold py-5 text-[11px] font-bold tracking-[0.3em] text-brand-white transition-all hover:bg-brand-midnight"
           >
             FINALIZAR ENCOMENDA
           </button>

           <Link
             href="/catalogo"
             className="block text-center py-4 text-[10px] font-bold tracking-[0.3em] text-brand-midnight/40 hover:text-brand-midnight transition-colors active:bg-brand-midnight/5"
           >
             CONTINUAR A COMPRAR
           </Link>
        </div>
      </aside>
    </div>
  );
}
