import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/signout
 *
 * A dedicated route handler for signing out. This is the correct place to
 * call supabase.auth.signOut() so that Set-Cookie headers are properly flushed
 * before the redirect, avoiding the stale-session loop caused by calling
 * signOut() inside a Server Component layout.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { searchParams } = request.nextUrl;
  const errorParam = searchParams.get("error") ?? "";

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.search = errorParam ? `?error=${errorParam}` : "";

  return NextResponse.redirect(redirectUrl);
}
