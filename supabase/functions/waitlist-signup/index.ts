import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://stagent.io",
  "https://stagent.github.io",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  corsHeaders: Record<string, string>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT = 5; // max signups per IP per hour

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, corsHeaders, 405);
  }

  try {
    const body = await req.json();
    const { email, website } = body;

    // Honeypot — bots fill hidden fields
    if (website) {
      // Silently accept to not tip off bots
      return jsonResponse({ success: true }, corsHeaders);
    }

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return jsonResponse({ error: "Please enter a valid email address." }, corsHeaders, 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Supabase client with service role (auto-injected)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if (count !== null && count >= RATE_LIMIT) {
      return jsonResponse(
        { error: "Too many requests. Please try again later." },
        corsHeaders,
        429,
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("waitlist")
      .select("email, confirmed")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      if (existing.confirmed) {
        return jsonResponse({
          success: true,
          message: "You're already subscribed.",
          already_confirmed: true,
        }, corsHeaders);
      }
      // Re-send confirmation for unconfirmed
      // Generate new token and update
      const newToken = crypto.randomUUID();
      await supabase
        .from("waitlist")
        .update({ confirm_token: newToken })
        .eq("email", cleanEmail);

      await sendConfirmationEmail(cleanEmail, newToken);

      return jsonResponse({
        success: true,
        message: "We sent another confirmation email. Check your inbox.",
      }, corsHeaders);
    }

    // Insert new signup
    const confirmToken = crypto.randomUUID();
    const userAgent = req.headers.get("user-agent") || "";

    const { error: insertError } = await supabase.from("waitlist").insert({
      email: cleanEmail,
      confirmed: false,
      confirm_token: confirmToken,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return jsonResponse({ error: "Something went wrong. Please try again." }, corsHeaders, 500);
    }

    // Send confirmation email
    await sendConfirmationEmail(cleanEmail, confirmToken);

    return jsonResponse({ success: true }, corsHeaders);
  } catch (err) {
    console.error("Unhandled error:", err);
    return jsonResponse({ error: "Something went wrong. Please try again." }, corsHeaders, 500);
  }
});

async function sendConfirmationEmail(email: string, token: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const confirmUrl = `${supabaseUrl}/functions/v1/confirm-email?token=${token}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Stagent <team@stagent.io>",
      to: [email],
      subject: "Confirm your Stagent newsletter subscription",
      html: confirmationEmailHtml(confirmUrl),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", res.status, text);
    throw new Error(`Resend API error: ${res.status}`);
  }
}

function confirmationEmailHtml(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'JetBrains Mono',monospace,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 24px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <!-- Logo -->
        <tr><td style="padding-bottom:32px;font-family:monospace;font-size:24px;letter-spacing:0.5em;color:#e8e4df;text-align:center;">
          STAGENT
        </td></tr>
        <!-- Rule -->
        <tr><td style="padding-bottom:32px;">
          <div style="height:1px;background:linear-gradient(90deg,transparent,#d4a843,transparent);"></div>
        </td></tr>
        <!-- Body -->
        <tr><td style="color:#b0aaa4;font-family:sans-serif;font-size:15px;line-height:1.7;padding-bottom:32px;">
          You requested the Stagent newsletter for release announcements, product notes, and governed AI operations updates.<br><br>
          Click below to confirm your subscription:
        </td></tr>
        <!-- CTA Button -->
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${confirmUrl}"
             style="display:inline-block;background:#d4a843;color:#0a0a0a;font-family:monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:14px 32px;">
            Confirm subscription
          </a>
        </td></tr>
        <!-- Fallback -->
        <tr><td style="color:#9a948e;font-family:sans-serif;font-size:12px;line-height:1.6;padding-bottom:32px;">
          If the button doesn't work, copy and paste this link:<br>
          <a href="${confirmUrl}" style="color:#4db8a4;word-break:break-all;">${confirmUrl}</a>
        </td></tr>
        <!-- Footer rule -->
        <tr><td style="padding-bottom:24px;">
          <div style="height:1px;background:#2a2725;"></div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="color:#9a948e;font-family:sans-serif;font-size:11px;text-align:center;">
          This link expires in 7 days. If you did not request Stagent updates, ignore this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
