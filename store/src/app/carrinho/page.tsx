import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
          Carrinho
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-brand-charcoal">
          Revê a tua encomenda
        </h1>
      </div>
      <CartPageClient />
    </main>
  );
}
