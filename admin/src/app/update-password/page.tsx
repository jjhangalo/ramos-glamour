"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Wait for Supabase to process the PKCE token from the URL hash
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if there's already an active session (token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
  }, []);

  async function onSubmit(data: FormData) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Palavra-passe definida com sucesso!");
    router.replace("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-6 py-16 relative grain-overlay">
      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur-xl p-10 shadow-2xl border border-brand-midnight/5">
        {/* Header */}
        <div className="space-y-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
            Administração
          </p>
          <h1 className="heading-luxury text-4xl font-light text-brand-midnight">
            Ramos Glamour
          </h1>
          <p className="text-[11px] font-medium text-brand-midnight/50 uppercase tracking-widest">
            Definir Palavra-passe
          </p>
        </div>

        {!sessionReady ? (
          <div className="mt-10 flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
            <p className="text-xs text-brand-midnight/50">
              A verificar o seu link de acesso...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
            <div className="space-y-1 text-center">
              <ShieldCheck className="mx-auto h-5 w-5 text-brand-gold" />
              <p className="text-xs text-brand-midnight/50">
                Introduza e confirme a sua nova palavra-passe de acesso ao painel.
              </p>
            </div>

            {/* Nova Palavra-passe */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
              >
                Nova Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("password")}
                  className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 pr-11 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-midnight/30 transition hover:text-brand-midnight"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar Palavra-passe */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 ml-1"
              >
                Confirmar Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="w-full rounded-xl border border-brand-midnight/10 bg-white/50 px-4 py-3 pr-11 text-sm outline-none transition focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-midnight/30 transition hover:text-brand-midnight"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full overflow-hidden rounded-xl bg-brand-midnight px-4 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white shadow-lg shadow-brand-midnight/20 transition-all hover:bg-brand-charcoal hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  A guardar...
                </span>
              ) : (
                "Definir Palavra-passe"
              )}
            </button>
          </form>
        )}

        <div className="mt-12 border-t border-brand-midnight/5 pt-8 text-center">
          <p className="text-[9px] font-medium text-brand-midnight/30 uppercase tracking-[0.4em]">
            © 2024 Ramos Glamour · Todos os direitos reservados
          </p>
        </div>
      </div>
    </main>
  );
}
