"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();
  const headerStore = await headers();
  
  // Dynamically determine site URL from headers for better dev experience
  const host = headerStore.get("host");
  const origin = headerStore.get("origin");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const siteUrl = origin || (host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000";
  
  // Base callback URL
  const callbackUrl = new URL(`${siteUrl}/auth/callback`);
  
  // If we have a specific path to return to, add it to the callback URL
  if (redirectTo) {
    callbackUrl.searchParams.set("next", redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/");
}
