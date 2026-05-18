"use client";

import { useMemo } from "react";

interface ProfileIdentityProps {
  profile: {
    full_name: string | null;
    email: string;
    created_at: string;
    email_verified: boolean;
  };
  location: string | null;
}

export function ProfileIdentity({ profile, location }: ProfileIdentityProps) {
  const initials = useMemo(() => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email[0].toUpperCase();
  }, [profile.full_name, profile.email]);

  const memberSince = useMemo(() => {
    return new Date(profile.created_at).getFullYear();
  }, [profile.created_at]);

  return (
    <div className="flex items-center gap-4 py-2">
      {/* Avatar / Initials */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-midnight text-white text-sm font-bold tracking-wider">
        {initials}
      </div>

      {/* Identity Details */}
      <div className="flex flex-col min-w-0">
        <h2 className="truncate text-base font-semibold tracking-tight text-brand-midnight">
          {profile.full_name || profile.email.split("@")[0]}
        </h2>
        
        <div className="flex flex-wrap items-center gap-x-2 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-midnight/40">
          <span>Membro desde {memberSince}</span>
          {profile.email_verified && (
            <>
              <span className="text-brand-midnight/20">•</span>
              <span className="text-brand-gold/80">Verificado</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
