import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { href: "/catalogo", label: "Coleções" },
    { href: "/catalogo?novidades=true", label: "Novidades" },
    { href: "/catalogo?promo=true", label: "Ofertas" },
  ];

  const brandLinks = [
    { href: "/#sobre", label: "A Marca" },
    { href: "/#contacto", label: "Contacto" },
    { href: "/termos", label: "Termos & Condições" },
  ];

  return (
    <footer className="w-full bg-brand-midnight text-brand-white pt-24 pb-12">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1 space-y-8">
            <Link href="/" className="inline-block">
              <div className="relative h-10 w-32 brightness-0 invert">
                <Image
                  src="/logo-horizontal.png"
                  alt="Ramos Glamour"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-[11px] leading-relaxed tracking-widest text-brand-white/50 max-w-xs">
              Elevando a essência feminina através de coleções exclusivas e curadoria de luxo. A sua boutique digital de referência em Angola.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">LOJA</h3>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[11px] font-medium tracking-widest text-brand-white/40 transition-colors hover:text-brand-white"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Brand */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">INSTITUCIONAL</h3>
            <ul className="space-y-4">
              {brandLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[11px] font-medium tracking-widest text-brand-white/40 transition-colors hover:text-brand-white"
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter/Contact */}
          <div className="space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">NEWSLETTER</h3>
            <p className="text-[11px] text-brand-white/40 tracking-widest">Subscreva para receber as nossas coleções exclusivas.</p>
            <div className="flex border-b border-brand-white/20 py-2">
              <input 
                type="email" 
                placeholder="EMAIL@EXEMPLO.COM" 
                className="bg-transparent text-[10px] tracking-[0.2em] outline-none flex-1 placeholder:text-brand-white/20"
              />
              <button className="text-[10px] font-bold tracking-[0.2em] text-brand-gold">OK</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-brand-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-bold tracking-[0.2em] text-brand-white/20">
            © {currentYear} RAMOS GLAMOUR. TODOS OS DIREITOS RESERVADOS.
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] font-bold tracking-[0.2em] text-brand-white/20 transition-colors hover:text-brand-white cursor-pointer">INSTAGRAM</span>
            <span className="text-[9px] font-bold tracking-[0.2em] text-brand-white/20 transition-colors hover:text-brand-white cursor-pointer">FACEBOOK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
