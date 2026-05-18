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
    <div className="mb-8 space-y-6">
      {/* Mobile Back Button — visible only on small screens */}
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 transition hover:text-brand-gold md:hidden"
      >
        <ChevronLeft className="h-3 w-3" />
        Voltar ao Perfil
      </Link>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30">
          Área de Cliente
        </p>
        <h1 className="mt-2 text-2xl font-light tracking-tight text-brand-midnight md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-brand-midnight/50 uppercase tracking-wider">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
