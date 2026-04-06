"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createOrder } from "@/lib/actions/orders";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils/format";

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
    return "Seleciona uma morada para continuar.";
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

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white/85 px-6 py-16 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <h1 className="text-3xl font-semibold text-brand-charcoal">
          O teu carrinho está vazio
        </h1>
        <p className="mt-3 text-brand-charcoal/75">
          Volta ao catálogo antes de iniciar o checkout.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push("/catalogo");
          }}
          className="mt-6 rounded-full bg-brand-olive px-6 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
        >
          Ir para o catálogo
        </button>
      </section>
    );
  }

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const hasAddressForConfirmation = useManualAddress
    ? [
        manualAddress.recipient_name,
        manualAddress.phone,
        manualAddress.province,
        manualAddress.city,
        manualAddress.neighborhood,
        manualAddress.street,
      ].every((value) => value.trim().length > 0)
    : Boolean(selectedAddress);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white/85 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            1
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Revisão do carrinho
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Confirma os itens antes de seguir para a morada.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-brand-charcoal/10 bg-brand-white/70 px-4 py-3"
            >
              <div>
                <p className="font-medium text-brand-charcoal">{item.name}</p>
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
          className="mt-5 text-sm font-medium text-brand-charcoal transition hover:text-brand-olive"
        >
          Editar no carrinho
        </button>
      </section>

      <section className="rounded-[2rem] bg-white/85 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            2
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Selecionar morada de entrega
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Escolhe uma morada guardada ou usa uma morada avulsa.
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
                  className={`rounded-[1.5rem] border p-5 text-left transition ${
                    isSelected
                      ? "border-brand-olive bg-brand-bg/70 shadow-sm"
                      : "border-brand-charcoal/10 bg-brand-white/70 hover:border-brand-mauve"
                  }`}
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
                    {address.label ?? "Morada guardada"}
                  </p>
                  <p className="mt-3 font-semibold text-brand-charcoal">
                    {address.recipient_name ?? userName}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-charcoal/75">
                    {formatAddress(address)}
                  </p>
                  {address.phone ? (
                    <p className="mt-2 text-sm text-brand-charcoal/70">
                      {address.phone}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-brand-charcoal/20 bg-brand-white/70 px-5 py-8">
            <p className="text-brand-charcoal">Não tens moradas guardadas</p>
            <button
              type="button"
              onClick={() => {
                router.push("/perfil/moradas");
              }}
              className="mt-4 rounded-full border border-brand-charcoal/15 px-5 py-3 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
            >
              Adicionar morada
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
            className="rounded-full border border-brand-charcoal/15 px-5 py-3 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
          >
            Usar outra morada
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
              Revê os dados finais antes de confirmar a encomenda.
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
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-brand-charcoal/10 bg-brand-white/70 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-brand-charcoal">{item.name}</p>
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
              <span>Total da encomenda</span>
              <span className="text-2xl font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="mt-3 text-sm text-brand-charcoal/70">
              A confirmação cria a encomenda, prepara a notificação e gera o
              link de WhatsApp para o seguimento.
            </p>
            <button
              type="button"
              disabled={isPending || !hasAddressForConfirmation}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const result = await createOrder({
                      items,
                      addressId: useManualAddress ? null : selectedAddressId,
                      manualAddress: useManualAddress ? manualAddress : null,
                      notes,
                    });

                    router.push(
                      `/checkout/confirmacao?whatsapp=${encodeURIComponent(
                        result.whatsappUrl,
                      )}&order=${encodeURIComponent(result.orderId)}`,
                    );
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível criar a encomenda.",
                    );
                  }
                });
              }}
              className="mt-6 w-full rounded-full bg-brand-olive px-5 py-4 text-sm font-medium text-brand-white transition hover:bg-[#8a904d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "A processar..." : "Confirmar encomenda"}
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
