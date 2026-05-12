"use client";

import { useState, useTransition, useEffect } from "react";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";

import { createOrder } from "@/lib/actions/orders";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils/format";
import { CheckoutButton } from "@/components/cart/CheckoutButton";
import { trackBeginCheckout } from "@/lib/analytics";

type StoredAddress = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  reference: string | null;
  is_default: boolean | null;
};

type CheckoutClientProps = {
  addresses: StoredAddress[];
  userName: string;
};

type ManualAddress = {
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  neighborhood: string;
  street: string;
  reference: string;
};

const emptyManualAddress: ManualAddress = {
  recipient_name: "",
  phone: "",
  province: "",
  city: "",
  neighborhood: "",
  street: "",
  reference: "",
};

function formatAddress(address: StoredAddress | ManualAddress | null | undefined) {
  if (!address) {
    return "Selecione uma morada para continuar.";
  }

  return [
    address.recipient_name,
    address.street,
    address.neighborhood,
    address.city,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");
}

export function CheckoutClient({ addresses, userName }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? null,
  );
  const [useManualAddress, setUseManualAddress] = useState(addresses.length === 0);
  const [notes, setNotes] = useState("");
  const [manualAddress, setManualAddress] =
    useState<ManualAddress>(emptyManualAddress);

  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(
        items.map((item) => ({
          id: item.id,
          name: item.displayName,
          price: item.price,
          quantity: item.quantity,
          variant: `${item.variantSize || ""}-${item.variantColor || ""}`,
        })),
        totalPrice
      );
    }
  }, [items, totalPrice]);

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/85 px-6 py-16 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <h2 className="heading-luxury text-3xl font-light mb-4">O seu carrinho está vazio</h2>
        <p className="text-[11px] font-medium tracking-widest text-brand-midnight/40 uppercase">
          Adicione alguns itens ao carrinho antes de prosseguir para o checkout.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push("/catalogo");
          }}
          className="mt-8 rounded-full bg-brand-midnight px-10 py-5 text-[11px] font-bold tracking-[0.2em] text-brand-white transition-all hover:bg-brand-midnight/90 active:scale-95 shadow-xl shadow-brand-midnight/10 touch-manipulation"
        >
          EXPLORAR CATÁLOGO
        </button>
      </section>
    );
  }

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white/85 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            1
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Revisão do Pedido
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Confirme os seus itens antes de prosseguir.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.itemKey}
              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-charcoal/10 bg-brand-white/70 px-4 py-3"
            >
              <div>
                <p className="font-medium text-brand-charcoal">{item.displayName}</p>
                <p className="text-sm text-brand-charcoal/70">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-medium text-brand-charcoal">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            router.push("/carrinho");
          }}
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-brand-charcoal px-6 py-3.5 text-[10px] font-bold tracking-[0.2em] text-brand-charcoal transition hover:bg-brand-bg active:bg-brand-midnight/5 touch-manipulation"
        >
          <Pencil className="h-4 w-4" />
          EDITAR NO CARRINHO
        </button>
      </section>

      <section className="rounded-[2rem] bg-white/85 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            2
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Morada de entrega
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Selecione uma morada guardada ou utilize uma nova.
            </p>
          </div>
        </div>

        {addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const isSelected = !useManualAddress && selectedAddressId === address.id;

              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => {
                    setUseManualAddress(false);
                    setSelectedAddressId(address.id);
                  }}
                  className={`rounded-[1.5rem] border p-6 text-left transition-all active:scale-[0.98] touch-manipulation ${
                    isSelected
                      ? "border-brand-olive bg-brand-bg/70 shadow-lg ring-1 ring-brand-olive"
                      : "border-brand-charcoal/10 bg-brand-white/70 hover:border-brand-mauve active:bg-brand-midnight/5"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-charcoal/40">
                    {address.label ?? "Morada guardada"}
                  </p>
                  <p className="mt-4 font-bold text-brand-charcoal">
                    {address.recipient_name ?? userName}
                  </p>
                  <p className="mt-3 text-[11px] leading-relaxed text-brand-charcoal/70 font-medium">
                    {formatAddress(address)}
                  </p>
                  {address.phone ? (
                    <p className="mt-3 text-[11px] font-bold text-brand-charcoal/60">
                      {address.phone}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-brand-charcoal/20 bg-brand-white/70 px-5 py-8">
            <p className="text-brand-charcoal">Sem moradas guardadas</p>
            <button
              type="button"
              onClick={() => {
                router.push("/perfil/moradas");
              }}
              className="mt-6 rounded-full border border-brand-charcoal/15 px-8 py-4 text-[10px] font-bold tracking-[0.2em] text-brand-charcoal transition hover:bg-brand-bg active:bg-brand-midnight/5 touch-manipulation"
            >
              ADICIONAR MORADA
            </button>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setUseManualAddress((current) => !current);
              setSelectedAddressId(null);
            }}
            className="rounded-full border border-brand-charcoal/15 px-8 py-4 text-[10px] font-bold tracking-[0.2em] text-brand-charcoal transition hover:bg-brand-bg active:bg-brand-midnight/5 touch-manipulation"
          >
            {useManualAddress ? "CANCELAR" : "UTILIZAR OUTRA MORADA"}
          </button>
        </div>

        {useManualAddress ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={manualAddress.recipient_name}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  recipient_name: event.target.value,
                }));
              }}
              placeholder="Nome do destinatário"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <input
              value={manualAddress.phone}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  phone: event.target.value,
                }));
              }}
              placeholder="Telefone"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <input
              value={manualAddress.province}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  province: event.target.value,
                }));
              }}
              placeholder="Província"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <input
              value={manualAddress.city}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  city: event.target.value,
                }));
              }}
              placeholder="Cidade"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <input
              value={manualAddress.neighborhood}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  neighborhood: event.target.value,
                }));
              }}
              placeholder="Bairro"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <input
              value={manualAddress.street}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  street: event.target.value,
                }));
              }}
              placeholder="Rua"
              className="rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
            <textarea
              value={manualAddress.reference}
              onChange={(event) => {
                setManualAddress((current) => ({
                  ...current,
                  reference: event.target.value,
                }));
              }}
              placeholder="Ponto de referência"
              className="md:col-span-2 min-h-28 rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            3
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Confirmação
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Reveja os detalhes finais antes de confirmar a encomenda.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-brand-charcoal">Itens</h3>
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.itemKey}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-brand-charcoal/10 bg-brand-white/70 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-brand-charcoal">{item.displayName}</p>
                      <p className="text-sm text-brand-charcoal/70">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-medium text-brand-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-brand-charcoal">Morada</h3>
              <div className="mt-3 rounded-2xl border border-brand-charcoal/10 bg-brand-white/70 px-4 py-4 text-sm leading-6 text-brand-charcoal/80">
                {useManualAddress
                  ? formatAddress(manualAddress)
                  : formatAddress(selectedAddress)}
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="text-lg font-semibold text-brand-charcoal"
              >
                Notas opcionais
              </label>
              <textarea
                id="checkout-notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                }}
                placeholder="Ex.: horário preferencial de entrega, observações..."
                className="mt-3 min-h-28 w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </div>
          </div>

          <aside className="rounded-[1.5rem] bg-brand-bg/60 p-5">
            <div className="flex items-center justify-between text-brand-charcoal">
              <span>Total da Encomenda</span>
              <span className="text-2xl font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="mt-3 text-sm text-brand-charcoal/70">
              A confirmação cria a encomenda, prepara a notificação e gera o link de WhatsApp para acompanhamento.
            </p>
            <div className="mt-8">
              <CheckoutButton 
                items={items}
                addressId={useManualAddress ? (manualAddress ? "manual" : null) : selectedAddressId}
                label="FINALIZAR COMPRA"
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
