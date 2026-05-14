import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { broadcastAdminPush, type AdminProfile } from "@/lib/notifications/webpush";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    console.error("Webhook Unauthorized: Invalid or missing token.");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const payload = await request.json();
    const newAdmin = payload.record;

    if (!newAdmin) {
      return NextResponse.json({ error: "Missing record in payload" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Fetch all admins to broadcast the notification
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id, push_subscription, dnd_enabled, dnd_start_time, dnd_end_time")
      .eq("role", "admin")
      .not("push_subscription", "is", null);

    if (error) {
      throw new Error(error.message);
    }

    if (admins && admins.length > 0) {
      // Exclude the new admin ID from broadcast if they somehow already have a subscription
      const eligibleAdmins = admins.filter(a => a.id !== newAdmin.id);
      
      if (eligibleAdmins.length > 0) {
        await broadcastAdminPush(
          eligibleAdmins as unknown as AdminProfile[],
          "Nova Conta Administrativa",
          "Um novo perfil de administrador foi provisionado no sistema.",
          "/encomendas"
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
