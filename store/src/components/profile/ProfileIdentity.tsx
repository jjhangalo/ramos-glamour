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
  const memberSince = useMemo(() => {
    return new Date(profile.created_at).getFullYear();
  }, [profile.created_at]);

  return (
    <div className="flex flex-col gap-2 border-l border-brand-midnight/10 pl-6 lg:pl-0 lg:border-l-0">
      {/* Primary Line: Identity */}
      <h2 className="text-xl font-medium tracking-tight text-brand-midnight">
        {profile.full_name || profile.email.split("@")[0]}
      </h2>

      {/* Secondary Line: Status Signals */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-midnight/40">
        <span>Membro desde {memberSince}</span>
        
        {location && (
          <span className="flex items-center before:content-['•'] before:mr-4">
            {location}
          </span>
        )}

        {profile.email_verified && (
          <span className="flex items-center before:content-['•'] before:mr-4 text-brand-gold/60">
            Email Verificado
          </span>
        )}
      </div>
    </div>
  );
}
