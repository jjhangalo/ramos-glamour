import { AuthButton } from "@/components/auth/AuthButton";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-6 py-16">
      <section className="w-full max-w-3xl rounded-[2rem] border border-brand-white/70 bg-brand-white/70 p-10 shadow-[0_30px_80px_rgba(98,98,96,0.12)] backdrop-blur">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/70">
              Ramos Glamour
            </p>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl leading-tight font-semibold text-brand-charcoal md:text-5xl">
                Base da loja preparada para autenticação com Google e Supabase.
              </h1>
              <p className="max-w-lg text-base leading-7 text-brand-charcoal/80">
                Estrutura inicial do storefront concluída sem adicionar páginas de
                catálogo ou lógica de carrinho.
              </p>
            </div>
          </div>

          <AuthButton />
        </div>
      </section>
    </main>
  );
}
