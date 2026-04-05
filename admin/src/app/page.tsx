import { signOut } from "@/lib/actions/auth";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Ramos Glamour
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Painel administrativo protegido por sessão.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-600">
              O middleware do admin redireciona utilizadores sem sessão para
              <span className="font-medium text-slate-900"> /login</span>.
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Sair
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
