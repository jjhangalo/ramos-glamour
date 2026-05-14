"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import { updateAdminProfile } from "@/lib/actions/settings";
import type { ClientRecord } from "@/lib/types";

type ProfileFormProps = {
  admin: ClientRecord;
};

export function ProfileForm({ admin }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(admin.avatar_url);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await updateAdminProfile(formData);
        if (result.success) {
          toast.success("Perfil atualizado com sucesso!");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        {/* Avatar Upload */}
        <div className="relative group mx-auto md:mx-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] border-2 border-brand-midnight/5 bg-brand-bg shadow-inner transition-all group-hover:border-brand-gold/30">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar Preview"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-midnight/20">
                <User className="h-12 w-12" />
              </div>
            )}
            
            <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-brand-midnight/40 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white">Alterar</span>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
                Nome Completo
              </label>
              <input
                required
                name="full_name"
                defaultValue={admin.full_name || ""}
                className="w-full rounded-2xl border border-brand-midnight/5 bg-white px-5 py-3.5 text-sm font-medium outline-none transition-all focus:border-brand-gold/30 focus:ring-8 focus:ring-brand-gold/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/40 ml-1">
                Email Corporativo
              </label>
              <input
                disabled
                value={admin.email || ""}
                className="w-full rounded-2xl border border-brand-midnight/5 bg-brand-bg/50 px-5 py-3.5 text-sm font-medium text-brand-midnight/40 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          disabled={isPending}
          type="submit"
          className="flex items-center gap-2 rounded-2xl bg-brand-midnight px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-midnight/90 active:scale-95 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar Alterações
        </button>
      </div>
    </form>
  );
}
