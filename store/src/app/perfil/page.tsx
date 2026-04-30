import Link from "next/link";
import { ShoppingBag, ArrowRight, Compass, Sparkles } from "lucide-react";
import { getDashboardData } from "@/lib/actions/profile";
import { DashboardOrderCard } from "@/components/profile/DashboardOrderCard";
import PageWithHeaderOffset from "@/components/layout/PageWithHeaderOffset";

export default async function ProfileIndexPage() {
  const { latestOrder, defaultAddress } = await getDashboardData();

  return (
    <PageWithHeaderOffset>
      <div className="space-y-12">
        {/* State Overview Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Primary: Latest Order (8 Columns) */}
          <div className="lg:col-span-8">
            {latestOrder ? (
              <DashboardOrderCard order={latestOrder} />
            ) : (
              <div className="flex flex-col items-start justify-center rounded-2xl border border-dashed border-brand-midnight/10 p-12 text-left bg-white/30">
                <div className="mb-4 rounded-full bg-brand-gold/5 p-3">
                  <ShoppingBag className="h-5 w-5 text-brand-gold/60" />
                </div>
                <p className="text-sm font-medium text-brand-midnight/60 mb-1">
                  Sem encomendas activas
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-midnight/30">
                  A sua próxima peça está à espera.
                </p>
                <Link 
                  href="/catalogo" 
                  className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold hover:opacity-80 transition-opacity"
                >
                  Explorar Colecção <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Secondary: Primary Address & Actions (4 Columns) */}
          <div className="space-y-8 lg:col-span-4">
            
            {/* Address Preview */}
            <div className="rounded-2xl bg-white border border-brand-midnight/5 p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 mb-4">
                Residência Principal
              </h4>
              {defaultAddress ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand-midnight">
                    {defaultAddress.label || "Morada"}
                  </p>
                  <p className="text-[11px] leading-relaxed text-brand-midnight/50 uppercase tracking-wider">
                    {defaultAddress.neighborhood}, {defaultAddress.city}<br />
                    {defaultAddress.province}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-medium text-brand-midnight/30 italic">
                  Nenhuma morada definida.
                </p>
              )}
              <Link 
                href="/perfil/moradas" 
                className="mt-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold hover:opacity-80 transition-opacity"
              >
                Gerir Moradas
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-brand-midnight p-6 text-white shadow-xl shadow-brand-midnight/10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
                Acesso Rápido
              </h4>
              <div className="grid gap-4">
                {!latestOrder && (
                  <Link 
                    href="/novidades" 
                    className="flex items-center justify-between rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Novidades</span>
                    </span>
                    <ArrowRight className="h-3 w-3 text-white/20" />
                  </Link>
                )}
                <Link 
                  href="/catalogo" 
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Compass className="h-4 w-4 text-brand-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Catálogo</span>
                  </span>
                  <ArrowRight className="h-3 w-3 text-white/20" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWithHeaderOffset>
  );
}
