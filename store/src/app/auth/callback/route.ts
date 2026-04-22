import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code);

  // Safely redirect to the next path
  const safeNext = next.startsWith("/") ? next : `/${next}`;
  
  return NextResponse.redirect(`${origin}${safeNext}`);
}
