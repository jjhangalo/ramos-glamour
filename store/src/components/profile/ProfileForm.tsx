"use client";

import { useState, useTransition } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { updateProfile } from "@/lib/actions/profile";

type ProfileFormProps = {
  profile: {
    full_name: string | null;
    display_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formValues, setFormValues] = useState({
    full_name: profile.full_name ?? "",
    display_name: profile.display_name ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
  });

  return (
    <section className="space-y-6 rounded-[2rem] bg-white/90 p-4 shadow-[0_16px_35px_rgba(98,98,96,0.08)] sm:p-6">
      <ProfileSectionHeader
        title="Os meus dados"
        description="Atualiza os dados principais da tua conta e mantém o contacto sempre correto."
      />

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="relative aspect-square w-28 overflow-hidden rounded-full border border-brand-charcoal/10 bg-brand-bg">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? profile.display_name ?? "Avatar"}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
              Conta Google
            </p>
            <p className="break-all text-sm text-brand-charcoal">{profile.email}</p>
          </div>
        </aside>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              try {
                await updateProfile(formData);
                toast.success("Perfil atualizado com sucesso");
                router.refresh();
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o perfil.",
                );
              }
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-brand-charcoal">
                Nome completo
              </span>
              <input
                name="full_name"
                value={formValues.full_name}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }));
                }}
                className="w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-brand-charcoal">
                Nome de apresentação
              </span>
              <input
                name="display_name"
                value={formValues.display_name}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    display_name: event.target.value,
                  }));
                }}
                className="w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-brand-charcoal">
                Telefone
              </span>
              <input
                name="phone"
                value={formValues.phone}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }));
                }}
                className="w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-brand-charcoal">
                WhatsApp
              </span>
              <input
                name="whatsapp"
                value={formValues.whatsapp}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    whatsapp: event.target.value,
                  }));
                }}
                className="w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-charcoal">Email</p>
            <div className="rounded-2xl border border-brand-charcoal/10 bg-brand-bg/50 px-4 py-3 text-sm text-brand-charcoal/70">
              {profile.email}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-brand-olive px-6 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "A guardar..." : "Guardar alterações"}
          </button>
        </form>
      </div>
    </section>
  );
}
