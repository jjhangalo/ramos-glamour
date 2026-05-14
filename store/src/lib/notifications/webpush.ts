import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@ramosglamour.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export type AdminProfile = {
  id: string;
  push_subscription: webpush.PushSubscription | null;
  dnd_enabled: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
};

/**
 * Pure function to evaluate if Do Not Disturb (DND) is active based on Africa/Luanda time.
 */
export function isDndActive(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pt-AO", {
    timeZone: "Africa/Luanda",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const timeString = formatter.format(now); // "HH:mm"
  
  if (startTime <= endTime) {
    // Normal interval (e.g., 08:00 - 22:00)
    return timeString >= startTime && timeString <= endTime;
  } else {
    // Midnight-crossing interval (e.g., 22:00 - 06:00)
    return timeString >= startTime || timeString <= endTime;
  }
}

/**
 * Broadcasts push notifications to multiple admins, respecting their DND settings.
 */
export async function broadcastAdminPush(
  admins: AdminProfile[],
  title: string,
  body: string,
  url: string = "/encomendas"
) {
  const eligibleAdmins = admins.filter((admin) => {
    if (!admin.push_subscription) return false;
    
    if (admin.dnd_enabled && admin.dnd_start_time && admin.dnd_end_time) {
      if (isDndActive(admin.dnd_start_time, admin.dnd_end_time)) {
        return false;
      }
    }
    
    return true;
  });

  if (eligibleAdmins.length === 0) return;

  const payload = JSON.stringify({ title, body, url });
  
  const results = await Promise.allSettled(
    eligibleAdmins.map((admin) => 
      webpush.sendNotification(admin.push_subscription!, payload)
    )
  );

  const deadSubscriptionUserIds: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const error = result.reason as { statusCode?: number };
      const admin = eligibleAdmins[index];
      
      console.error(`Error broadcasting push to ${admin.id}:`, error.statusCode);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
        deadSubscriptionUserIds.push(admin.id);
      }
    }
  });

  if (deadSubscriptionUserIds.length > 0) {
    console.log(`Cleaning up ${deadSubscriptionUserIds.length} dead admin subscriptions`);
    const supabase = createAdminClient();
    await supabase
      .from("profiles")
      .update({ push_subscription: null })
      .in("id", deadSubscriptionUserIds);
  }
}
