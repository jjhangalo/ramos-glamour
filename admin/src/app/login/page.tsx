import { signIn } from "@/lib/actions/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-sm border border-slate-200">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Console de Operações
          </p>
          <h1 className="text-3xl font-bold text-slate-950 tracking-tight">Ramos Glamour</h1>
          <p className="text-sm font-medium text-slate-500">
            Acesso restrito ao painel administrativo.
          </p>
        </div>

        <form action={signIn} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Email Corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
              placeholder="admin@ramosglamour.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Palavra-passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
              placeholder="••••••••"
            />
          </div>

          {params.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {params.error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-800"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-8 text-center">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            © 2024 Ramos Glamour · Operational Console
          </p>
        </div>
      </div>
    </main>
  );
}
