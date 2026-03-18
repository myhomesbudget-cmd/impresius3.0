import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const origin = new URL(request.url).origin;

  if (token_hash && type) {
    // Determine redirect destination based on auth type
    let redirectPath = next;
    if (type === "recovery") {
      redirectPath = "/update-password";
    } else if (type === "signup" || type === "email") {
      redirectPath = "/login?confirmed=true";
    }

    const redirectUrl = new URL(redirectPath, origin);
    const response = NextResponse.redirect(redirectUrl.toString());

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return response;
    }
  }

  // Auth error - redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
