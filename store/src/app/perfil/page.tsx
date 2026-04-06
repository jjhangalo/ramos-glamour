import Link from "next/link";

import { ChevronRight, MapPin, ShoppingBag, User } from "lucide-react";

const profileLinks = [
  {
    href: "/perfil/dados",
    label: "Os meus dados",
    icon: User,
  },
  {
    href: "/perfil/moradas",
    label: "As minhas moradas",
    icon: MapPin,
  },
  {
    href: "/perfil/encomendas",
    label: "As minhas encomendas",
    icon: ShoppingBag,
  },
];

export default function ProfileIndexPage() {
  return (
    <>
      <section className="space-y-4 md:hidden">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
            Área do cliente
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-charcoal">
            A tua conta
          </h1>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
          {profileLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between gap-4 border-b border-brand-charcoal/10 px-4 py-4 text-brand-charcoal transition active:bg-brand-bg last:border-b-0"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{label}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-brand-charcoal/55" />
            </Link>
          ))}
        </div>
      </section>

      <section className="hidden rounded-[2rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)] md:block">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
          Área do cliente
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-charcoal">
          A tua conta
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-charcoal/70">
          Usa a navegação lateral para gerir dados pessoais, moradas e histórico
          de encomendas.
        </p>
      </section>
    </>
  );
}
