"use server";

import { createClient } from "@/lib/supabase/server";
import { getProduct } from "./products";

export type CartItem = {
  id: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
};

export async function processCheckout(
  cartItems: CartItem[],
  addressId: string,
  notes?: string,
) {
  if (cartItems.length === 0) {
    throw new Error("O carrinho está vazio.");
  }

  const supabase = await createClient();

  // 1. Validate User Session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Acesso não autorizado. Por favor, faça login.");
  }

  // 2. Server-Side Price Calculation — never trust client prices
  let calculatedTotal = 0;
  const processedItems: {
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    variant_id: string | null;
    variant_size: string | null;
    variant_color: string | null;
  }[] = [];

  for (const item of cartItems) {
    const product = await getProduct(item.id);

    if (!product) {
      throw new Error(`Produto não encontrado: ${item.id}`);
    }

    // Base price: use active promo price if available, otherwise regular price
    let unitPrice = product.promo_price ?? product.price;
    let variantSize: string | null = item.variantSize ?? null;
    let variantColor: string | null = item.variantColor ?? null;

    if (item.variantId) {
      const variant = product.variants?.find((v) => v.id === item.variantId);

      if (!variant) {
        throw new Error(`Variante não encontrada: ${item.variantId}`);
      }

      // Variant price_override takes precedence over product price
      if (variant.price_override !== null && variant.price_override !== undefined) {
        unitPrice = variant.price_override;
      }

      variantSize = variant.size ?? null;
      variantColor = variant.color ?? null;
    }

    calculatedTotal += unitPrice * item.quantity;

    processedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_price: unitPrice,
      quantity: item.quantity,
      variant_id: item.variantId ?? null,
      variant_size: variantSize,
      variant_color: variantColor,
    });
  }

  // 3. Insert primary order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      total: calculatedTotal,
      status: "pending",
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Falha ao criar a encomenda.");
  }

  try {
    // 4. Insert all order items in a single batch
    const itemsToInsert = processedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      throw itemsError;
    }

    return { success: true as const, orderId: order.id };
  } catch (error) {
    // 5. Compensate — delete the orphaned order on item insertion failure
    console.error(
      "Erro ao inserir itens da encomenda, revertendo encomenda:",
      error,
    );
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(
      "Falha ao processar os itens da encomenda. A transação foi revertida.",
    );
  }
}
