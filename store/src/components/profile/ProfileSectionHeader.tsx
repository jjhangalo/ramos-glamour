import Link from "next/link";

import { ChevronLeft } from "lucide-react";

type ProfileSectionHeaderProps = {
  title: string;
  description?: string;
};

export function ProfileSectionHeader({
  title,
  description,
}: ProfileSectionHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-charcoal transition hover:text-brand-olive md:hidden"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
          Área do cliente
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-charcoal">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/70">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
