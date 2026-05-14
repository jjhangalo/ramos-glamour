import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcastAdminPush, type AdminProfile } from "@/lib/notifications/webpush";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  
  // Fetch active promotions with product name for the notification
  const { data: promotions, error } = await supabase
    .from("promotions")
    .select("id, is_active, ends_at, products(name)")
    .eq("is_active", true);

  if (error) {
    console.error("Cron Error fetching promotions:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type PromotionItem = {
    id: string;
    ends_at: string | null;
    products: { name: string } | { name: string }[] | null;
  };

  const now = new Date();
  const expiredPromotions: PromotionItem[] = [];
  const expiringSoonPromotions: PromotionItem[] = [];

  const msIn24h = 24 * 60 * 60 * 1000;
  const msIn48h = 48 * 60 * 60 * 1000;

  for (const promo of (promotions as unknown as PromotionItem[]) || []) {
    if (!promo.ends_at) continue;

    const endDate = new Date(promo.ends_at);
    const diff = endDate.getTime() - now.getTime();

    if (diff < 0) {
      expiredPromotions.push(promo);
    } else if (diff >= msIn24h && diff <= msIn48h) {
      expiringSoonPromotions.push(promo);
    }
  }

  // 1. Deactivate expired promotions
  if (expiredPromotions.length > 0) {
    const ids = expiredPromotions.map((p) => p.id);
    const { error: updateError } = await supabase
      .from("promotions")
      .update({ is_active: false })
      .in("id", ids);
      
    if (updateError) {
      console.error("Cron Error deactivating promotions:", updateError.message);
    }
  }

  // 2. Fetch admins for broadcasting
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, push_subscription, dnd_enabled, dnd_start_time, dnd_end_time")
    .eq("role", "admin")
    .not("push_subscription", "is", null);

  if (admins && admins.length > 0) {
    const adminProfiles = admins as unknown as AdminProfile[];

    // Process expired notifications
    for (const promo of expiredPromotions) {
      const productName = Array.isArray(promo.products) 
        ? promo.products[0]?.name 
        : promo.products?.name || "Produto";

      // We don't await each broadcast to speed up the cron, but allSettled is inside broadcastAdminPush
      broadcastAdminPush(
        adminProfiles,
        "Campanha Encerrada",
        `A promoção ${productName} expirou e foi desativada.`,
        "/promocoes"
      ).catch(err => console.error("Broadcast error (expired):", err));
    }

    // Process warnings (24h-48h window)
    for (const promo of expiringSoonPromotions) {
      const productName = Array.isArray(promo.products) 
        ? promo.products[0]?.name 
        : promo.products?.name || "Produto";

      broadcastAdminPush(
        adminProfiles,
        "Aviso de Validade",
        `A promoção ${productName} encerra em menos de 48 horas.`,
        "/promocoes"
      ).catch(err => console.error("Broadcast error (warning):", err));
    }
  }

  return NextResponse.json({
    processed: promotions?.length || 0,
    deactivated: expiredPromotions.length,
    warnings: expiringSoonPromotions.length,
    timestamp: now.toISOString(),
  });
}
