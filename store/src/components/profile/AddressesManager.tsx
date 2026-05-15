"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/lib/actions/addresses";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription as SheetDesc,
} from "@/components/ui/sheet";

type Address = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  reference: string | null;
  is_default: boolean;
};

type AddressesManagerProps = {
  addresses: Address[];
};

type AddressFormState = {
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  neighborhood: string;
  street: string;
  reference: string;
};

const emptyAddress: AddressFormState = {
  label: "",
  recipient_name: "",
  phone: "",
  province: "",
  city: "",
  neighborhood: "",
  street: "",
  reference: "",
};

function toFormState(address?: Address | null): AddressFormState {
  if (!address) {
    return emptyAddress;
  }

  return {
    label: address.label ?? "",
    recipient_name: address.recipient_name ?? "",
    phone: address.phone ?? "",
    province: address.province ?? "",
    city: address.city ?? "",
    neighborhood: address.neighborhood ?? "",
    street: address.street ?? "",
    reference: address.reference ?? "",
  };
}

function buildFormData(values: AddressFormState) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
}

export function AddressesManager({ addresses }: AddressesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formValues, setFormValues] = useState<AddressFormState>(emptyAddress);

  const orderedAddresses = useMemo(
    () =>
      [...addresses].sort((a, b) => {
        if (a.is_default === b.is_default) return 0;
        return a.is_default ? -1 : 1;
      }),
    [addresses],
  );

  return (
    <div className="space-y-12">
      <ProfileSectionHeader
        title="Delivery Addresses"
        description="Save and organize your delivery locations for a faster checkout."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setFormValues(emptyAddress);
            setIsSheetOpen(true);
          }}
          className="group flex items-center justify-center gap-4 bg-brand-midnight px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white transition-all hover:bg-brand-gold"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {orderedAddresses.map((address) => (
          <article
            key={address.id}
            className="rounded-[1.75rem] bg-white/90 p-8 shadow-[0_16px_35px_rgba(98,98,96,0.08)] border border-brand-midnight/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  {address.label ?? "Address"}
                </p>
                <h2 className="mt-2 text-xl font-light tracking-tight text-brand-midnight">
                  {address.recipient_name}
                </h2>
              </div>
              {address.is_default ? (
                <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-gold">
                  Default
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-2 text-[11px] font-medium leading-relaxed text-brand-midnight/60 uppercase tracking-wider">
              <p>{address.phone}</p>
              <p>{address.province}, {address.city}</p>
              <p>{address.neighborhood}{address.street ? ` · ${address.street}` : ""}</p>
              {address.reference && <p className="mt-2 text-brand-midnight/30 italic">Ref: {address.reference}</p>}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-brand-midnight/5">
              {!address.is_default ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await setDefaultAddress(address.id);
                        toast.success("Default address updated");
                        router.refresh();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Unable to set default address.");
                      }
                    });
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-midnight/40 hover:text-brand-gold transition"
                >
                  Set as Default
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(address);
                  setFormValues(toFormState(address));
                  setIsSheetOpen(true);
                }}
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-midnight/40 hover:text-brand-midnight transition"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (!confirm("Are you sure you want to remove this address?")) return;
                  startTransition(async () => {
                    try {
                      await deleteAddress(address.id);
                      toast.success("Address removed");
                      router.refresh();
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to remove address.");
                    }
                  });
                }}
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 hover:text-red-500 transition ml-auto"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-xl font-light tracking-tight text-brand-midnight">
              {editingAddress ? "Edit Address" : "Add Address"}
            </SheetTitle>
            <SheetDesc className="text-xs uppercase tracking-wider text-brand-midnight/40">
              Save your delivery details for faster checkout.
            </SheetDesc>
          </SheetHeader>

          <form
            className="grid gap-6 mt-8"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                try {
                  const formData = buildFormData(formValues);
                  if (editingAddress) {
                    await updateAddress(editingAddress.id, formData);
                    toast.success("Address updated");
                  } else {
                    await createAddress(formData);
                    toast.success("Address created");
                  }
                  setIsSheetOpen(false);
                  setEditingAddress(null);
                  setFormValues(emptyAddress);
                  router.refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to save address.");
                }
              });
            }}
          >
            {(
              [
                ["label", "Label (Home, Work, etc)"],
                ["recipient_name", "Recipient Name"],
                ["phone", "Phone Number"],
                ["province", "Province"],
                ["city", "City"],
                ["neighborhood", "Neighborhood"],
                ["street", "Street"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                  {label}
                </span>
                <input
                  value={formValues[key]}
                  onChange={(event) => {
                    setFormValues((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                  }}
                  className="w-full border-b border-brand-midnight/10 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none transition focus:border-brand-gold"
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                Reference Point
              </span>
              <textarea
                value={formValues.reference}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    reference: event.target.value,
                  }));
                }}
                className="min-h-24 w-full border-b border-brand-midnight/10 bg-transparent py-3 text-[11px] font-semibold tracking-widest outline-none transition focus:border-brand-gold resize-none"
              />
            </label>

            <SheetFooter className="mt-8">
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40 hover:text-brand-midnight transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-brand-midnight px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-white transition-all hover:bg-brand-gold disabled:opacity-50"
              >
                {isPending ? "SAVING..." : "SAVE ADDRESS"}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
