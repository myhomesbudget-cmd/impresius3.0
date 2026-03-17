import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = new URL(request.url).origin;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect based on auth type
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/update-password`);
      }
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(`${origin}/login?confirmed=true`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
