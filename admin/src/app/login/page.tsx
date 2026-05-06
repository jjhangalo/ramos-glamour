import { signIn } from "@/lib/actions/auth";
import { LoginForm } from "./LoginForm";

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

        <LoginForm action={signIn} error={params.error} />

        <div className="mt-12 border-t border-brand-midnight/5 pt-8 text-center">
          <p className="text-[9px] font-medium text-brand-midnight/30 uppercase tracking-[0.4em]">
            © 2024 Ramos Glamour · Todos os direitos reservados
          </p>
        </div>
      </div>
    </main>
  );
}

