import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-bg shadow-sm">
        <FileQuestion className="h-12 w-12 text-brand-charcoal/60" />
      </div>
      <h1 className="mb-2 text-6xl font-bold tracking-tight text-brand-charcoal">404</h1>
      <h2 className="mb-6 text-2xl font-semibold text-brand-charcoal/80">Página não encontrada</h2>
      <p className="mb-10 max-w-md text-muted-foreground">
        Pedimos desculpa, mas a página que procura não existe ou foi movida. 
        Pode voltar à página inicial para continuar a sua experiência.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-brand-olive px-10 py-4 text-lg font-medium text-brand-white shadow-lg transition duration-300 hover:bg-[#8a904d] hover:shadow-xl active:scale-95"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
