"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { allowedImageMimeTypes, maxImageSize } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductVariantRecord } from "@/lib/types";

type VariantInput = {
  size: string;
  color: string;
  stock: number;
  is_available: boolean;
  price_override: number | null;
};

function validateImage(file: File) {
  if (!allowedImageMimeTypes.includes(file.type)) {
    return "Formato não suportado. Usa JPEG, PNG ou WebP.";
  }

  if (file.size > maxImageSize) {
    return "A imagem não pode ter mais de 10 MB.";
  }

  return null;
}

function getStoragePath(bucket: string, url: string) {
  const marker = `/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export async function getVariants(productId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, size, color, stock, is_available, price_override, created_at, updated_at, variant_images(id, variant_id, url, position)",
    )
    .eq("product_id", productId)
    .order("created_at");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProductVariantRecord[];
}

export async function createVariant(productId: string, input: VariantInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    size: input.size.trim() || null,
    color: input.color.trim() || null,
    stock: input.stock,
    is_available: input.is_available,
    price_override: input.price_override,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function updateVariant(
  variantId: string,
  productId: string,
  input: VariantInput,
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      size: input.size.trim() || null,
      color: input.color.trim() || null,
      stock: input.stock,
      is_available: input.is_available,
      price_override: input.price_override,
    })
    .eq("id", variantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function deleteVariant(variantId: string, productId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/produtos/${productId}`);
  revalidatePath("/produtos");
  return { success: true };
}

export async function uploadVariantImages(variantId: string, formData: FormData) {
  const supabase = createAdminClient();
  const files = formData.getAll("files");

  if (!files.length) {
    return { success: false, error: "Selecciona pelo menos uma imagem válida." };
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("product_id")
    .eq("id", variantId)
    .single();

  if (variantError) {
    return { success: false, error: variantError.message };
  }

  const results = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const validationError = validateImage(file);
    if (validationError) {
      return { success: false, error: `${file.name}: ${validationError}` };
    }

    const extension = file.name.split(".").pop() ?? "jpg";
    const storagePath = `${variantId}/${Date.now()}-${randomUUID()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("variant-images")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Erro no upload (${file.name}): ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("variant-images").getPublicUrl(storagePath);

    results.push({ url: publicUrl });
  }

  const { data: lastImage } = await supabase
    .from("variant_images")
    .select("position")
    .eq("variant_id", variantId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextPosition = (lastImage?.position ?? -1) + 1;

  const { error: insertError } = await supabase.from("variant_images").insert(
    results.map((res) => ({
      variant_id: variantId,
      url: res.url,
      position: nextPosition++,
    })),
  );

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath(`/produtos/${variant.product_id}`);
  return { success: true };
}

export async function deleteVariantImage(imageId: string, productId: string) {
  const supabase = createAdminClient();
  const { data: image, error: fetchError } = await supabase
    .from("variant_images")
    .select("id, url")
    .eq("id", imageId)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const storagePath = getStoragePath("variant-images", image.url);
  if (storagePath) {
    await supabase.storage.from("variant-images").remove([storagePath]);
  }

  const { error } = await supabase.from("variant_images").delete().eq("id", imageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/produtos/${productId}`);
  return { success: true };
}
