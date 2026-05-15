"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { ProfileSectionHeader } from "./ProfileSectionHeader";

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
    <div className="space-y-12">
      <ProfileSectionHeader 
        title="Personal Data"
        description="Manage your identity and contact information for a better experience."
      />

      <div className="grid gap-16 lg:grid-cols-[240px_1fr]">
        {/* Status Info */}
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold">AUTHENTICATION</p>
            <div className="flex items-center gap-3 text-[11px] font-medium tracking-widest text-brand-midnight/60">
              <Mail className="h-3 w-3" />
              {profile.email}
            </div>
            <p className="text-[9px] text-brand-midnight/30 tracking-widest mt-4 leading-relaxed uppercase">
              Your account is protected. Login credentials cannot be changed here.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form
          className="space-y-12"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              try {
                await updateProfile(formData);
                toast.success("Profile updated successfully");
                router.refresh();
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to update profile.",
                );
              }
            });
          }}
        >
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                FULL NAME
              </label>
              <input
                name="full_name"
                value={formValues.full_name}
                onChange={(event) => setFormValues(v => ({ ...v, full_name: event.target.value }))}
                className="w-full border-b border-brand-midnight/10 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none transition focus:border-brand-gold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                DISPLAY NAME
              </label>
              <input
                name="display_name"
                value={formValues.display_name}
                onChange={(event) => setFormValues(v => ({ ...v, display_name: event.target.value }))}
                className="w-full border-b border-brand-midnight/10 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none transition focus:border-brand-gold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                PHONE
              </label>
              <div className="flex items-center gap-3 border-b border-brand-midnight/10 focus-within:border-brand-gold transition">
                <Phone className="h-3 w-3 text-brand-midnight/20" />
                <input
                  name="phone"
                  value={formValues.phone}
                  onChange={(event) => setFormValues(v => ({ ...v, phone: event.target.value }))}
                  className="flex-1 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                WHATSAPP
              </label>
              <div className="flex items-center gap-3 border-b border-brand-midnight/10 focus-within:border-brand-gold transition">
                <MessageSquare className="h-3 w-3 text-brand-midnight/20" />
                <input
                  name="whatsapp"
                  value={formValues.whatsapp}
                  onChange={(event) => setFormValues(v => ({ ...v, whatsapp: event.target.value }))}
                  className="flex-1 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="group flex items-center gap-4 bg-brand-midnight px-10 py-5 text-[10px] font-bold tracking-[0.3em] text-brand-white transition-all hover:bg-brand-gold disabled:opacity-50"
            >
              {isPending ? "SAVING..." : "SAVE CHANGES"}
              {!isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
