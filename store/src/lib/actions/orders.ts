"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CartItemPayload = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type ManualAddressPayload = {
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  neighborhood: string;
  street: string;
  reference: string;
};

type CreateOrderInput = {
  items: CartItemPayload[];
  addressId: string | null;
  manualAddress: ManualAddressPayload | null;
  notes?: string;
};

function buildAddressSummary(address: ManualAddressPayload) {
  return [
    address.recipient_name,
    address.street,
    address.neighborhood,
    address.city,
    address.province,
    address.reference,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildWhatsAppUrl(args: {
  customerName: string;
  items: CartItemPayload[];
  total: number;
  address: string;
}) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!number) {
    throw new Error("Define NEXT_PUBLIC_WHATSAPP_NUMBER antes de confirmar a encomenda.");
  }

  const itemsText = args.items
    .map(
      (item) =>
        `- ${item.name}: ${item.quantity} x ${new Intl.NumberFormat("pt-AO").format(
          item.price,
        )} Kz`,
    )
    .join("\n");

  const text = [
    "Olá! Fiz uma encomenda na Ramos Glamour.",
    `Nome: ${args.customerName}`,
    "Itens:",
    itemsText,
    `Total: ${new Intl.NumberFormat("pt-AO").format(args.total)} Kz`,
    `Morada: ${args.address}`,
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export async function createOrder(input: CreateOrderInput) {
  if (input.items.length === 0) {
    throw new Error("O carrinho está vazio.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão inválida. Volta a iniciar sessão.");
  }

  const total = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  let addressId = input.addressId;
  let addressSummary = "";

  if (!addressId) {
    if (!input.manualAddress) {
      throw new Error("Seleciona ou preenche uma morada de entrega.");
    }

    const { data: insertedAddress, error: addressError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: "Morada avulsa",
        recipient_name: input.manualAddress.recipient_name,
        phone: input.manualAddress.phone,
        province: input.manualAddress.province,
        city: input.manualAddress.city,
        neighborhood: input.manualAddress.neighborhood,
        street: input.manualAddress.street,
        reference: input.manualAddress.reference,
        is_default: false,
      })
      .select("id")
      .single();

    if (addressError || !insertedAddress) {
      throw new Error(addressError?.message ?? "Não foi possível guardar a morada.");
    }

    addressId = insertedAddress.id;
    addressSummary = buildAddressSummary(input.manualAddress);
  } else {
    const { data: existingAddress, error: existingAddressError } = await supabase
      .from("addresses")
      .select(
        "recipient_name, phone, province, city, neighborhood, street, reference",
      )
      .eq("id", addressId)
      .single();

    if (existingAddressError || !existingAddress) {
      throw new Error(
        existingAddressError?.message ?? "Não foi possível carregar a morada.",
      );
    }

    addressSummary = buildAddressSummary({
      recipient_name: existingAddress.recipient_name ?? "",
      phone: existingAddress.phone ?? "",
      province: existingAddress.province ?? "",
      city: existingAddress.city ?? "",
      neighborhood: existingAddress.neighborhood ?? "",
      street: existingAddress.street ?? "",
      reference: existingAddress.reference ?? "",
    });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      status: "pending",
      notes: input.notes ?? null,
      total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Não foi possível criar a encomenda.");
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: null,
    product_name: item.name,
    product_price: item.price,
    quantity: item.quantity,
  }));

  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  const payload = {
    order_id: order.id,
    user_id: user.id,
    customer_name:
      user.user_metadata.full_name ?? user.email ?? "Cliente Ramos Glamour",
    total,
    address: addressSummary,
    items: input.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  const adminSupabase = createAdminClient();
  const { error: notificationError } = await adminSupabase
    .from("notifications")
    .insert({
      type: "new_order",
      payload,
    });

  if (notificationError) {
    throw new Error(notificationError.message);
  }

  const whatsappUrl = buildWhatsAppUrl({
    customerName:
      user.user_metadata.full_name ?? user.email ?? "Cliente Ramos Glamour",
    items: input.items,
    total,
    address: addressSummary,
  });

  // TODO: enviar email ao administrador usando ADMIN_EMAIL ou Edge Function.

  return {
    orderId: order.id,
    whatsappUrl,
  };
}
