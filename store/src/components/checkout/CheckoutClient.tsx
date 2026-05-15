"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import type { CartItem } from "@/lib/actions/checkout";
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
    return "Select an address to continue.";
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
        <h2 className="heading-luxury text-3xl font-light mb-4">Your cart is empty</h2>
        <p className="text-[11px] font-medium tracking-widest text-brand-midnight/40 uppercase">
          Add some items to your cart before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push("/catalogo");
          }}
          className="mt-8 rounded-full bg-brand-midnight px-10 py-5 text-[11px] font-bold tracking-[0.2em] text-brand-white transition-all hover:bg-brand-midnight/90 active:scale-95 shadow-xl shadow-brand-midnight/10 touch-manipulation"
        >
          EXPLORE CATALOG
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
              Order Review
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Confirm your items before proceeding.
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
          EDIT IN CART
        </button>
      </section>

      <section className="rounded-[2rem] bg-white/85 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-olive text-sm font-semibold text-brand-white">
            2
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-brand-charcoal">
              Delivery Address
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Select a saved address or use a new one.
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
                    {address.label ?? "Saved Address"}
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
            <p className="text-brand-charcoal">No saved addresses</p>
            <button
              type="button"
              onClick={() => {
                router.push("/profile/addresses");
              }}
              className="mt-6 rounded-full border border-brand-charcoal/15 px-8 py-4 text-[10px] font-bold tracking-[0.2em] text-brand-charcoal transition hover:bg-brand-bg active:bg-brand-midnight/5 touch-manipulation"
            >
              ADD ADDRESS
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
            {useManualAddress ? "CANCEL" : "USE ANOTHER ADDRESS"}
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
              placeholder="Recipient name"
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
              placeholder="Phone"
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
              placeholder="Province"
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
              placeholder="City"
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
              placeholder="Neighborhood"
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
              placeholder="Street"
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
              placeholder="Reference point"
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
              Confirmation
            </h2>
            <p className="text-sm text-brand-charcoal/70">
              Review final details before confirming your order.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-brand-charcoal">Items</h3>
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
              <h3 className="text-lg font-semibold text-brand-charcoal">Address</h3>
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
                Optional Notes
              </label>
              <textarea
                id="checkout-notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                }}
                placeholder="E.g.: preferred delivery time, special instructions..."
                className="mt-3 min-h-28 w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </div>
          </div>

          <aside className="rounded-[1.5rem] bg-brand-bg/60 p-5">
            <div className="flex items-center justify-between text-brand-charcoal">
              <span>Order Total</span>
              <span className="text-2xl font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="mt-3 text-sm text-brand-charcoal/70">
              Confirmation creates the order, prepares notifications, and generates a WhatsApp link for tracking.
            </p>
            <div className="mt-8">
              <CheckoutButton
                items={items.map(
                  (item): CartItem => ({
                    id: item.id,
                    variantId: item.variantId ?? undefined,
                    variantSize: item.variantSize ?? undefined,
                    variantColor: item.variantColor ?? undefined,
                    quantity: item.quantity,
                  }),
                )}
                addressId={useManualAddress ? null : selectedAddressId}
                notes={notes}
                label="COMPLETE PURCHASE"
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
