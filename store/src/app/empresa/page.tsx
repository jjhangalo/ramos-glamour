import Image from "next/image";
import Link from "next/link";

export default function EmpresaPage() {
  const sectionBackgrounds = {
    manifesto: "/empresa-manifesto.png",
    vision: "/empresa-vision.png",
    texture: "/empresa-texture-luxury.png",
    precision: "/empresa-precision-luxury.png",
    curation: "/empresa-curation-luxury.png",
  } as const;

  return (
    <main className="flex flex-1 flex-col bg-brand-bg">
      {/* ── 1. Brand Manifesto (The Foundation) ────────────────────── */}
      <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={sectionBackgrounds.manifesto}
            alt="Material Foundation"
            fill
            className="object-cover opacity-30 grayscale brightness-110 transition-transform duration-[10000ms]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-transparent to-brand-bg" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 flex flex-col items-center space-y-2">
            <span className="text-[9px] font-bold tracking-[0.6em] text-brand-gold/60">REF. 001 // PRINCIPLE</span>
            <p className="animate-fade-in text-[10px] font-bold uppercase tracking-[0.5em] text-brand-gold opacity-0 [animation-delay:500ms] [animation-fill-mode:forwards]">
              MANIFESTO
            </p>
          </div>
          <h1 className="heading-luxury animate-slide-up text-4xl font-light leading-relaxed text-brand-midnight opacity-0 md:text-6xl [animation-delay:1000ms] [animation-fill-mode:forwards]">
            A elegância não é uma escolha, <br /> é uma <span className="italic">consequência</span> da verdade.
          </h1>
          <div className="mx-auto mt-12 h-16 w-[1px] bg-brand-midnight/10 animate-fade-in opacity-0 [animation-delay:2000ms] [animation-fill-mode:forwards]" />
        </div>
      </section>

      {/* ── 2. The Form (The Result) ─────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1400px] overflow-hidden px-6 py-32 md:px-12 lg:py-64">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]">
          <Image
            src={sectionBackgrounds.vision}
            alt=""
            fill
            className="object-cover grayscale"
          />
        </div>
        <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
          {/* Presence without Identity */}
          <div className="relative aspect-[4/5] overflow-hidden bg-brand-midnight/5 lg:aspect-square lg:w-4/5">
             <Image 
               src={sectionBackgrounds.vision}
               alt="A Forma"
               fill
               className="object-cover grayscale brightness-105 contrast-110"
             />
             <div className="absolute inset-0 bg-brand-midnight/10 backdrop-grayscale" />
             {/* Annotation */}
             <div className="absolute bottom-6 left-6 text-[9px] font-bold tracking-[0.3em] text-brand-white/70">
               [ SILHOUETTE CALIBRATION // MT-02 ]
             </div>
          </div>

          {/* Controlled Narrative */}
          <div className="flex flex-col justify-center space-y-10 lg:pl-12">
            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.4em] text-brand-gold/60">02 // ESTRUTURA</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
                A FORMA
              </p>
            </div>
            <div className="space-y-8 max-w-md">
              <h2 className="heading-luxury text-3xl font-light leading-tight text-brand-midnight md:text-4xl">
                Onde o <span className="italic text-brand-gold">propósito</span> <br /> dita a forma.
              </h2>
              <p className="text-[13px] leading-relaxed tracking-wide text-brand-midnight/70">
                A Ramos Glamour baseia-se na intenção de criar objetos onde o luxo é medido pela precisão do detalhe e pela integridade do material. O corpo não é o sujeito, mas o suporte necessário para revelar a estrutura.
              </p>
              <p className="text-[13px] leading-relaxed tracking-wide text-brand-midnight/70">
                A nossa abordagem é um exercício de restrição. Cada peça justifica a sua existência através da relação entre material e proporção, resultando numa silhueta que é a resolução inevitável da sua própria construção.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Forensic Evidence (The Proof) ──────────────────────── */}
      <section className="bg-white py-32 lg:py-64">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
          <div className="mb-24 flex flex-col items-center text-center">
            <span className="mb-4 text-[9px] font-bold tracking-[0.4em] text-brand-gold/60">03 // EVIDÊNCIA</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
              PROVA MATERIAL
            </p>
            <h2 className="heading-luxury mt-4 text-3xl font-light md:text-5xl">
              Verdade <span className="italic font-serif">Inerente</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "TEXTURA", 
                ref: "ORIGIN",
                desc: "Fibras naturais selecionadas pela integridade estrutural e toque orgânico.",
                img: sectionBackgrounds.texture
              },
              { 
                title: "PRECISÃO", 
                ref: "METHOD",
                desc: "Construção rigorosa que prioriza a estabilidade e o comportamento do material.",
                img: sectionBackgrounds.precision
              },
              { 
                title: "CURADORIA", 
                ref: "CONSTRAINT",
                desc: "Disciplina cromática e tonal que elimina o excesso e foca no essencial.",
                img: sectionBackgrounds.curation
              }
            ].map((item) => (
              <div key={item.title} className="group space-y-8">
                <div className="relative aspect-square overflow-hidden bg-brand-midnight/5">
                  <Image 
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover grayscale brightness-105 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 text-[8px] font-bold tracking-widest text-brand-midnight/40">
                    [ {item.ref} ]
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight">{item.title}</h3>
                  <p className="text-[11px] leading-relaxed tracking-widest text-brand-midnight/60 uppercase max-w-[240px]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. The Exit ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center py-48 text-center">
        <div className="mb-12 h-16 w-[1px] bg-brand-gold" />
        <Link 
          href="/catalogo"
          className="group relative text-[10px] font-bold tracking-[0.4em] text-brand-midnight/60 transition-colors hover:text-brand-midnight"
        >
          INSPECCIONAR A CURADORIA
          <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-brand-gold transition-all duration-700 group-hover:w-full" />
        </Link>
      </section>
    </main>
  );
}
