import Image from "next/image";

export default function ContactoPage() {
  return (
    <main className="flex flex-1 flex-col bg-brand-bg">
      {/* ── 1. The Quiet Invitation (Hero) ────────────────────────── */}
      <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-8">
          <span className="text-[9px] font-bold tracking-[0.6em] text-brand-gold/60">REF. 004 // DIALOGUE</span>
          <h1 className="heading-luxury animate-slide-up text-4xl font-light leading-relaxed text-brand-midnight md:text-6xl">
            O diálogo é a extensão <br /> da nossa <span className="italic">curadoria</span>.
          </h1>
          <div className="mx-auto h-16 w-[1px] bg-brand-midnight/10" />
        </div>
      </section>

      {/* ── 2. The System (Contact Dossier) ───────────────────────── */}
      <section className="mx-auto w-full max-w-[1400px] px-6 py-24 md:px-12 lg:py-48">
        <div className="grid gap-24 lg:grid-cols-2">
          
          {/* Acessos (Direct Channels) */}
          <div className="space-y-16">
            <div className="space-y-4">
              <span className="text-[9px] font-bold tracking-[0.4em] text-brand-gold/60">01 // ACESSO DIRETO</span>
              <h2 className="heading-luxury text-2xl font-light tracking-wide text-brand-midnight uppercase">Canais</h2>
            </div>
            
            <div className="space-y-12">
              <div className="space-y-2">
                <p className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/30 uppercase">WhatsApp</p>
                <a 
                  href="https://wa.me/244923000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm font-medium tracking-[0.2em] text-brand-midnight hover:text-brand-gold transition-colors"
                >
                  +244 923 000 000
                </a>
              </div>
              
              <div className="space-y-2">
                <p className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/30 uppercase">Email</p>
                <a 
                  href="mailto:geral@ramosglamour.com" 
                  className="block text-sm font-medium tracking-[0.2em] text-brand-midnight hover:text-brand-gold transition-colors"
                >
                  GERAL@RAMOSGLAMOUR.COM
                </a>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/30 uppercase">Presença</p>
                <p className="text-sm font-medium tracking-[0.2em] text-brand-midnight">
                  LUANDA, ANGOLA
                </p>
              </div>
            </div>
          </div>

          {/* Requisição (The Form) */}
          <div className="space-y-16 bg-white p-8 md:p-16 shadow-sm border border-brand-midnight/5">
            <div className="space-y-4">
              <span className="text-[9px] font-bold tracking-[0.4em] text-brand-gold/60">02 // REQUISIÇÃO</span>
              <h2 className="heading-luxury text-2xl font-light tracking-wide text-brand-midnight uppercase">Dossier de Contacto</h2>
            </div>

            <form className="space-y-12">
              <div className="space-y-2 border-b border-brand-midnight/10 pb-4">
                <label htmlFor="name" className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/40 uppercase">Nome</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="w-full bg-transparent text-sm font-medium tracking-wide outline-none placeholder:text-brand-midnight/10"
                  required
                />
              </div>

              <div className="space-y-2 border-b border-brand-midnight/10 pb-4">
                <label htmlFor="email" className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/40 uppercase">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-transparent text-sm font-medium tracking-wide outline-none placeholder:text-brand-midnight/10"
                  required
                />
              </div>

              <div className="space-y-2 border-b border-brand-midnight/10 pb-4">
                <label htmlFor="message" className="text-[9px] font-bold tracking-[0.3em] text-brand-midnight/40 uppercase">Mensagem</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4}
                  className="w-full bg-transparent text-sm font-medium tracking-wide outline-none resize-none placeholder:text-brand-midnight/10"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="group relative w-full py-6 text-[10px] font-bold tracking-[0.4em] text-brand-midnight transition-colors border border-brand-midnight/10 hover:bg-brand-midnight hover:text-brand-white"
              >
                SUBMETER REQUISIÇÃO
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── 3. Observational Reality ────────────────────────────── */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-brand-midnight/5 grayscale contrast-110">
        <Image 
          src="/contacto-reality.png"
          alt="Atelier Observation"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-brand-midnight/5" />
        <div className="absolute bottom-12 left-12">
          <span className="text-[9px] font-bold tracking-[0.4em] text-brand-white/50 uppercase">
            [ OBS. MT-04 // MATERIAL AT REST ]
          </span>
        </div>
      </section>
    </main>
  );
}
