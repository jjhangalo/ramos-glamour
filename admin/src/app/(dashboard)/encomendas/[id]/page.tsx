import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  MessageCircle, 
  Calendar, 
  Hash,
  ChevronRight,
  Info
} from "lucide-react";

import { OrderContextualActions } from "@/components/orders/OrderContextualActions";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { getOrder, getOrderWhatsappLink } from "@/lib/actions/orders";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const whatsappUrl = await getOrderWhatsappLink(id);
  const customerName =
    order.profiles?.full_name ||
    order.profiles?.display_name ||
    "Cliente sem nome";

  return (
    <PageCanvas size="list" className="space-y-12 py-12 pb-32 overflow-x-hidden">
      {/* Header & Back Button */}
      <FadeUp className="flex flex-col gap-6">
        <Link
          href="/encomendas"
          className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 transition hover:text-brand-midnight"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Voltar para a lista
        </Link>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30">
              Operações de Venda
            </p>
            <h1 className="heading-luxury text-4xl font-light text-brand-midnight">
              Gestão de Encomenda
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-midnight/20">
              #{shortId(order.id)}
            </span>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </FadeUp>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px] w-full max-w-full">
        {/* Main Column */}
        <div className="space-y-10 min-w-0">
          {/* Order Summary Card */}
          <FadeUp delay={0.1}>
            <article className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-6 md:p-10 shadow-sm overflow-hidden">
              <div className="grid gap-8 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                    <Calendar className="h-3 w-3" /> Data da Compra
                  </p>
                  <p className="text-sm font-bold text-brand-midnight">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                    <Hash className="h-3 w-3" /> Identificador
                  </p>
                  <p className="font-mono text-[10px] font-bold text-brand-midnight/60 truncate">
                    {order.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                    <CreditCard className="h-3 w-3" /> Valor Total
                  </p>
                  <p className="text-xl font-bold text-brand-midnight">
                    {formatPrice(order.total)}
                  </p>
                </div>
                {order.notes && (
                  <div className="sm:col-span-3 space-y-1 pt-6 border-t border-brand-midnight/5">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      <Info className="h-3 w-3" /> Notas do Cliente
                    </p>
                    <p className="text-sm text-brand-midnight/60 leading-relaxed italic">
                      "{order.notes}"
                    </p>
                  </div>
                )}
              </div>
            </article>
          </FadeUp>

          {/* Items Section */}
          <section className="space-y-6">
            <FadeUp delay={0.2} className="flex items-center gap-4">
              <ShoppingBag className="h-5 w-5 text-brand-midnight/30" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
                Artigos na Encomenda
              </h2>
            </FadeUp>

            <StaggerContainer className="space-y-4">
              {order.order_items?.map((item) => {
                const variantImages = item.product_variants?.variant_images || [];
                const productImages = item.products?.product_images || [];
                
                const firstVariantImage = [...variantImages].sort((a, b) => a.position - b.position)[0]?.url;
                const firstProductImage = [...productImages].sort((a, b) => a.position - b.position)[0]?.url;
                
                const finalImage = firstVariantImage || firstProductImage;

                return (
                  <StaggerItem
                    key={item.id}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-white p-6 md:p-8 transition-all hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-midnight/5"
                  >
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <div className="relative flex h-14 w-14 md:h-20 md:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-bg/50 transition-transform group-hover:scale-105">
                        {finalImage ? (
                          <Image
                            src={finalImage}
                            alt={item.product_name}
                            fill
                            sizes="(max-width: 768px) 56px, 80px"
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-brand-midnight/20" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm md:text-base font-bold text-brand-midnight">
                          {item.product_name}
                        </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30 mt-1">
                        {[item.variant_size, item.variant_color]
                          .filter(Boolean)
                          .join(" · ") || "Edição Única"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 md:gap-8 border-t lg:border-0 border-brand-midnight/5 pt-4 lg:pt-0 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-midnight/20 mb-1">
                        Preço
                      </p>
                      <p className="text-xs font-bold text-brand-midnight/60">
                        {formatPrice(item.product_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-midnight/20 mb-1">
                        Qtd
                      </p>
                      <p className="text-xs font-bold text-brand-midnight">
                        {item.quantity}
                      </p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-midnight/20 mb-1">
                        Sub-total
                      </p>
                      <p className="text-base font-bold text-brand-midnight">
                        {formatPrice(item.product_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Operations Card */}
          <FadeUp delay={0.3}>
            <section className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 mb-8 px-1">
                Ações de Operação
              </h2>
              <div className="space-y-4">
                <OrderContextualActions orderId={order.id} status={order.status} />
                {whatsappUrl && (
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-brand-midnight/5 bg-white py-4 text-sm font-bold text-brand-midnight transition-all hover:bg-brand-bg hover:border-brand-midnight/20 active:scale-[0.98]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#25D366] transition-transform group-hover:scale-110" />
                    Contactar Cliente
                  </Link>
                )}
              </div>
            </section>
          </FadeUp>

          {/* Customer Card */}
          <FadeUp delay={0.4}>
            <section className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 mb-8 px-1">
                Informação do Cliente
              </h2>
              <Link 
                href={`/clientes/${order.user_id}`}
                className="group flex items-center gap-4 rounded-2xl bg-brand-bg/50 p-4 transition-all hover:bg-brand-midnight hover:text-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-midnight shadow-sm group-hover:bg-brand-midnight/20 group-hover:text-white">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">
                    {customerName}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Ver Perfil Completo
                  </p>
                </div>
              </Link>
            </section>
          </FadeUp>

          {/* Logistics Card */}
          <FadeUp delay={0.5}>
            <section className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30 mb-8 px-1">
                Logística & Entrega
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg/50 text-brand-midnight/40">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">Destino</p>
                    <p className="text-sm font-bold text-brand-midnight leading-relaxed">
                      {order.addresses?.recipient_name || "N/D"}<br />
                      <span className="text-xs font-medium text-brand-midnight/50">
                        {order.addresses?.street}, {order.addresses?.neighborhood}<br />
                        {order.addresses?.city}, {order.addresses?.province}
                      </span>
                    </p>
                    {order.addresses?.reference && (
                      <p className="mt-2 text-[10px] italic text-brand-midnight/40 leading-relaxed border-l-2 border-brand-midnight/5 pl-3">
                        "{order.addresses.reference}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-bg/50 text-brand-midnight/40">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">Pagamento</p>
                    <p className="text-sm font-bold text-brand-midnight">Pagamento na Entrega</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/20">Canal: Loja Online</p>
                  </div>
                </div>
              </div>
            </section>
          </FadeUp>
        </aside>
      </div>
    </PageCanvas>
  );
}
