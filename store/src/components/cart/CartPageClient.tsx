"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Minus, Plus, Trash2 } from "lucide-react";

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!hasHydrated) {
    return (
      <section className="rounded-[2rem] bg-white/80 px-6 py-16 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <p className="text-brand-charcoal/50 text-sm">A carregar...</p>
      </section>
    );
  }
  
  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/80 px-6 py-16 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <h1 className="text-3xl font-semibold text-brand-charcoal">
          O teu carrinho está vazio
        </h1>
        <p className="mt-3 text-brand-charcoal/75">
          Escolhe os teus favoritos e adiciona-os antes de finalizar a encomenda.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-full bg-brand-olive px-6 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
        >
          Ir para o catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.itemKey}
            className="flex gap-4 rounded-[1.5rem] bg-white/85 p-4 shadow-[0_16px_35px_rgba(98,98,96,0.08)]"
          >
            <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-xl">
              <Image
                src={item.image}
                alt={item.displayName}
                fill
                className="object-cover"
                sizes="60px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-brand-charcoal">
                  {item.displayName}
                </h2>
                <p className="mt-1 text-sm text-brand-charcoal/70">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-brand-charcoal/15 bg-brand-white p-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateQuantity(item.itemKey, item.quantity - 1);
                    }}
                    className="rounded-full p-2 text-brand-charcoal transition hover:bg-brand-bg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateQuantity(item.itemKey, item.quantity + 1);
                    }}
                    className="rounded-full p-2 text-brand-charcoal transition hover:bg-brand-bg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.itemKey);
                  }}
                  className="rounded-full border border-brand-charcoal/10 p-3 text-brand-charcoal transition hover:bg-brand-bg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="rounded-[2rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)] lg:sticky lg:top-28 lg:h-fit">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
          Resumo
        </p>
        <div className="mt-6 space-y-4 text-brand-charcoal">
          <div className="flex items-center justify-between">
            <span>Total de itens</span>
            <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              router.push("/checkout");
            }}
            className="mt-8 w-full rounded-full bg-brand-olive px-5 py-4 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
          >
            Finalizar encomenda
          </button>
        ) : (
          <form action={signInWithGoogle} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-full bg-brand-olive px-5 py-4 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
            >
              Finalizar encomenda
            </button>
          </form>
        )}
      </aside>
    </section>
  );
}
