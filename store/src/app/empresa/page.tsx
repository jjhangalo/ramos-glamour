import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EmpresaPage() {
  return (
    <main className="flex flex-1 flex-col bg-brand-bg">
      {/* ── 1. Brand Manifesto (Primary Layer) ────────────────────── */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Atmospheric Abstraction Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png" // Using hero as an atmospheric base for now
            alt="Atmosfera Ramos Glamour"
            fill
            className="object-cover opacity-20 grayscale brightness-125 transition-transform duration-[10000ms] hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-transparent to-brand-bg" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-8 animate-fade-in text-[10px] font-bold uppercase tracking-[0.5em] text-brand-gold opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]">
            MANIFESTO
          </p>
          <h1 className="heading-luxury animate-slide-up text-4xl font-light leading-relaxed text-brand-midnight opacity-0 md:text-6xl [animation-delay:1000ms] [animation-fill-mode:forwards]">
            A elegância não é uma escolha, <br /> é uma <span className="italic">consequência</span> da verdade.
          </h1>
          <div className="mx-auto mt-12 h-16 w-[1px] bg-brand-midnight/10 animate-fade-in opacity-0 [animation-delay:2000ms] [animation-fill-mode:forwards]" />
        </div>
      </section>

      {/* ── 2. Founder / Vision (Secondary Layer) ─────────────────── */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-32 md:px-12 lg:py-64">
        <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
          {/* Asymmetric Visual */}
          <div className="relative aspect-[4/5] overflow-hidden bg-brand-midnight/5 lg:aspect-square lg:w-4/5">
             <Image 
               src="/ramos_glamour_moodboard_1777041120310.png"
               alt="Visão Ramos Glamour"
               fill
               className="object-cover grayscale brightness-110 contrast-125"
             />
             <div className="absolute inset-0 bg-brand-midnight/5" />
          </div>

          {/* Controlled Text Block */}
          <div className="flex flex-col justify-center space-y-10 lg:pl-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
              A VISÃO
            </p>
            <div className="space-y-8 max-w-md">
              <h2 className="heading-luxury text-3xl font-light leading-tight text-brand-midnight md:text-4xl">
                Onde o <span className="italic text-brand-gold">propósito</span> <br /> encontra a forma.
              </h2>
              <p className="text-sm leading-relaxed tracking-wide text-brand-midnight/60">
                A Ramos Glamour nasceu da intenção deliberada de criar um espaço onde o luxo não é medido pelo excesso, mas pela precisão do detalhe e pela nobreza do material. 
              </p>
              <p className="text-sm leading-relaxed tracking-wide text-brand-midnight/60">
                A nossa curadoria é um exercício de restrição. Escolhemos apenas o que justifica a sua própria existência, acreditando que a verdadeira sofisticação reside na relação silenciosa entre quem veste e o que é vestido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Craftsmanship & Quality (Proof Layer) ─────────────── */}
      <section className="bg-white py-32 lg:py-64">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
          <div className="mb-24 flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
              QUALIDADE
            </p>
            <h2 className="heading-luxury mt-4 text-3xl font-light md:text-5xl">
              Verdade <span className="italic font-serif">Material</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Documentation Elevated to Luxury */}
            {[
              { 
                title: "TEXTURA", 
                desc: "Fibras naturais selecionadas pela sua integridade estrutural e toque orgânico.",
                img: "/hero.png" // Placeholder for macro texture
              },
              { 
                title: "PRECISÃO", 
                desc: "Construção rigorosa que prioriza a longevidade e a queda impecável da peça.",
                img: "/ramos_glamour_hero_image_1777041456184.png" // Placeholder for detail
              },
              { 
                title: "CURADORIA", 
                desc: "Uma seleção limitada de acabamentos que resistem à efemeridade das tendências.",
                img: "/hero.png" // Placeholder
              }
            ].map((item, i) => (
              <div key={item.title} className="group space-y-8">
                <div className="relative aspect-square overflow-hidden bg-brand-midnight/5 grayscale contrast-125 brightness-105">
                  <Image 
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight">{item.title}</h3>
                  <p className="text-[11px] leading-relaxed tracking-widest text-brand-midnight/50 uppercase max-w-[240px]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. The Quiet Invitation (Exit) ───────────────────────── */}
      <section className="flex flex-col items-center justify-center py-48 text-center">
        <div className="mb-12 h-16 w-[1px] bg-brand-gold" />
        <Link 
          href="/catalogo"
          className="group relative text-[10px] font-bold tracking-[0.4em] text-brand-midnight/60 transition-colors hover:text-brand-midnight"
        >
          EXPLORAR A CURADORIA
          <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-brand-gold transition-all duration-700 group-hover:w-full" />
        </Link>
      </section>
    </main>
  );
}
