import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { href: "/", label: "Início" },
    { href: "/catalogo", label: "Catálogo" },
  ];

  const accountLinks = [
    { href: "/perfil", label: "O meu perfil" },
    { href: "/perfil/encomendas", label: "As minhas encomendas" },
    { href: "/perfil/moradas", label: "As minhas moradas" },
  ];

  return (
    <footer className="w-full bg-brand-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 brightness-0 invert">
                <Image
                  src="/icon1.png"
                  alt="Ramos Glamour"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Ramos Glamour
              </span>
            </div>
            <p className="max-w-xs text-sm text-brand-mauve">
              Moda feminina por encomenda. Elevando a sua elegância com peças exclusivas.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-white">
              Loja
            </h3>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-bg/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-white">
              A minha conta
            </h3>
            <ul className="space-y-4">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-bg/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="my-12 h-px w-full bg-white opacity-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-xs text-brand-bg/60">
            © {currentYear} Ramos Glamour. Todos os direitos reservados.
          </p>
          <p className="text-xs text-brand-mauve">
            Feito com amor em Angola
          </p>
        </div>
      </div>
    </footer>
  );
}
