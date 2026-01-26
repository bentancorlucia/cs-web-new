import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/mi-cuenta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If this is a password recovery, redirect to the reset password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/nueva-contrasena`);
      }

      // For email confirmation, redirect to the intended page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to an error page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
