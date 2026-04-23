import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const returnTo =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}${returnTo}`);
  }

  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code);

  const redirectUrl = new URL(returnTo, origin);
  redirectUrl.searchParams.set("cart_preserved", "1");

  return NextResponse.redirect(redirectUrl.toString());
}
