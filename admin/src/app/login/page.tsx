import { signIn } from "@/lib/actions/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-6 py-16 relative grain-overlay">
      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-xl p-10 shadow-2xl border border-brand-midnight/5">
        <div className="space-y-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
            Administração
          </p>
          <h1 className="heading-luxury text-4xl font-light text-brand-midnight">Ramos Glamour</h1>
          <p className="text-[11px] font-medium text-brand-midnight/50 uppercase tracking-widest">
            Acesso Restrito
          </p>
        </div>

        <form action={signIn} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1">
              Email Corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
              placeholder="admin@ramosglamour.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
            >
              Palavra-passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
              placeholder="••••••••"
            />
          </div>

          {params.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs font-medium text-red-700 text-center animate-in fade-in slide-in-from-top-1">
              {params.error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-midnight px-4 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white shadow-lg shadow-brand-midnight/20 transition-all hover:bg-brand-charcoal hover:shadow-xl active:scale-[0.98]"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-12 border-t border-brand-midnight/5 pt-8 text-center">
          <p className="text-[9px] font-medium text-brand-midnight/30 uppercase tracking-[0.4em]">
            © 2024 Ramos Glamour · Todos os direitos reservados
          </p>
        </div>
      </div>
    </main>
  );
}
