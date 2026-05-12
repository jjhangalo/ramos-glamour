"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { useCartStore } from "@/lib/store/cart";
import { trackPurchase } from "@/lib/analytics";

type CheckoutConfirmationClientProps = {
  whatsappUrl: string | null;
};

export function CheckoutConfirmationClient({
  whatsappUrl,
}: CheckoutConfirmationClientProps) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (items.length > 0) {
      trackPurchase({
        id: orderId || "ORDER_" + Date.now(),
        total: totalPrice,
        items: items.map(item => ({
          id: item.id,
          name: item.displayName,
          price: item.price,
          quantity: item.quantity,
          variant: `${item.variantSize || ""}-${item.variantColor || ""}`
        })),
      });
      clearCart();
    }
  }, [items, totalPrice, clearCart, orderId]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] bg-white/90 p-8 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)] md:p-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-brand-olive" />
        <h1 className="mt-6 text-4xl font-semibold text-brand-charcoal">
          Encomenda recebida!
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-brand-charcoal/75">
          A sua encomenda foi registada com sucesso. Entraremos em contacto brevemente.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-olive px-6 py-4 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
            >
              Acompanhar via WhatsApp
            </a>
          ) : null}

          <Link
            href="/perfil/encomendas"
            className="rounded-full border border-brand-charcoal/15 px-6 py-4 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
          >
            Ver as minhas encomendas
          </Link>
          <Link
            href="/catalogo"
            className="rounded-full border border-brand-charcoal/15 px-6 py-4 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
          >
            Continuar a comprar
          </Link>
        </div>
      </div>
    </section>
  );
}
