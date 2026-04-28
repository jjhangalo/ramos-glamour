import { CartPageClient } from "@/components/cart/CartPageClient";

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Editorial Header */}
      <section className="bg-brand-white border-b border-brand-midnight/5 py-12 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold mb-4">
              CARRINHO
            </p>
            <h1 className="heading-luxury text-4xl font-light md:text-7xl">
              A Sua Seleção
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-12 lg:px-12 lg:py-24">
        <CartPageClient />
      </section>
    </main>
  );
}
