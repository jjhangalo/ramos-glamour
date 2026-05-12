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
  SheetDescription,
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
        if (a.is_default === b.is_default) {
          return 0;
        }

        return a.is_default ? -1 : 1;
      }),
    [addresses],
  );


  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="As minhas moradas"
        description="Guarde e organize as suas moradas de entrega para um checkout mais rápido."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setFormValues(emptyAddress);
            setIsSheetOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-olive px-5 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d]"
        >
          <Plus className="h-4 w-4" />
          Adicionar morada
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {orderedAddresses.map((address) => (
          <article
            key={address.id}
            className="rounded-[1.75rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
                  {address.label ?? "Morada"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-brand-charcoal">
                  {address.recipient_name}
                </h2>
              </div>
              {address.is_default ? (
                <span className="rounded-full bg-brand-olive px-3 py-1 text-xs font-medium text-brand-white">
                  Principal
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-2 text-sm leading-6 text-brand-charcoal/75">
              <p>{address.phone}</p>
              <p>{address.province}</p>
              <p>{address.city}</p>
              <p>{address.neighborhood}</p>
              <p>{address.street}</p>
              <p>{address.reference}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {!address.is_default ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await setDefaultAddress(address.id);
                        toast.success("Morada principal actualizada");
                        router.refresh();
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Não foi possível definir a morada principal.",
                        );
                      }
                    });
                  }}
                  className="rounded-full border border-brand-charcoal/15 px-4 py-2 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
                >
                  Definir como principal
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(address);
                  setFormValues(toFormState(address));
                  setIsSheetOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-brand-charcoal/15 px-4 py-2 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await deleteAddress(address.id);
                      toast.success("Morada removida");
                      router.refresh();
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "Não foi possível remover a morada.",
                      );
                    }
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editingAddress ? "Editar morada" : "Adicionar morada"}
            </SheetTitle>
            <SheetDesc>
              Guarde os seus dados de entrega para acelerar futuras encomendas.
            </SheetDesc>
          </SheetHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              startTransition(async () => {
                try {
                  const formData = buildFormData(formValues);

                  if (editingAddress) {
                    await updateAddress(editingAddress.id, formData);
                    toast.success("Morada actualizada");
                  } else {
                    await createAddress(formData);
                    toast.success("Morada criada");
                  }

                  setIsSheetOpen(false);
                  setEditingAddress(null);
                  setFormValues(emptyAddress);
                  router.refresh();
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível guardar a morada.",
                  );
                }
              });
            }}
          >
            {(
              [
                ["label", "Etiqueta"],
                ["recipient_name", "Nome do Destinatário"],
                ["phone", "Telefone"],
                ["province", "Província"],
                ["city", "Cidade"],
                ["neighborhood", "Bairro"],
                ["street", "Rua"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="space-y-2">
                <span className="text-sm font-medium text-brand-charcoal">
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
                  className="w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className="text-sm font-medium text-brand-charcoal">
                Ponto de referência
              </span>
              <textarea
                value={formValues.reference}
                onChange={(event) => {
                  setFormValues((current) => ({
                    ...current,
                    reference: event.target.value,
                  }));
                }}
                className="min-h-28 w-full rounded-2xl border border-brand-charcoal/15 bg-brand-white px-4 py-3 outline-none transition focus:border-brand-olive"
              />
            </label>

            <SheetFooter>
              <button
                type="button"
                onClick={() => {
                  setIsSheetOpen(false);
                }}
                className="rounded-full border border-brand-charcoal/15 px-5 py-3 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-brand-olive px-5 py-3 text-sm font-medium text-brand-white transition hover:bg-[#8a904d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "A guardar..." : "Guardar morada"}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
