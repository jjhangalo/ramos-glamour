"use server";

import { createClient } from "@/lib/supabase/server";
import { getProduct } from "./products";

type CartItem = {
  id: string;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
  quantity: number;
};

export async function processCheckout(cartItems: CartItem[], addressId: string) {
  const supabase = await createClient();

  // 1. Validate User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Acesso não autorizado. Por favor, faça login.");
  }

  // 2. Server-Side Price Calculation
  let calculatedTotal = 0;
  const processedItems = [];

  for (const item of cartItems) {
    const product = await getProduct(item.id);
    if (!product) {
      throw new Error(`Produto não encontrado: ${item.id}`);
    }

    let unitPrice = product.promo_price || product.price;
    let variantSize = item.variantSize || null;
    let variantColor = item.variantColor || null;

    if (item.variantId) {
      const variant = product.variants?.find(v => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Variante não encontrada: ${item.variantId}`);
      }
      if (variant.price_override !== null) {
        unitPrice = variant.price_override;
      }
      variantSize = variant.size;
      variantColor = variant.color;
    }

    calculatedTotal += unitPrice * item.quantity;
    processedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_price: unitPrice,
      quantity: item.quantity,
      variant_id: item.variantId || null,
      variant_size: variantSize,
      variant_color: variantColor,
    });
  }

  // 3. Create Order in Transactional-like flow
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      total: calculatedTotal,
      status: "pending"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Falha ao criar a encomenda.");
  }

  try {
    // 4. Insert Order Items
    const itemsToInsert = processedItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      throw itemsError;
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    // 5. Revert Order Insertion if items fail (Manual Rollback)
    console.error("Erro ao inserir itens da encomenda, revertendo encomenda:", error);
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("Falha ao processar os itens da encomenda. Transação revertida.");
  }
}
