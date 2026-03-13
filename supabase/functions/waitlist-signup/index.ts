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
  const colors = {
    background: "#0f172a",
    surface: "#131c31",
    surfaceRaised: "#18233d",
    border: "#2a3551",
    text: "#eef2ff",
    textMuted: "#a7b0c8",
    textDim: "#7f8aa7",
    primary: "#7c8cff",
    primaryGlow: "#c7d2fe",
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:${colors.background};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:${colors.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Confirm your Stagent newsletter subscription for release announcements, product notes, and governed AI operations updates.
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${colors.background};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="padding:0 0 20px;font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:26px;letter-spacing:0.42em;color:${colors.text};text-align:center;">
              STAGENT
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 16px;text-align:center;">
              <span style="display:inline-block;padding:8px 12px;border:1px solid ${colors.border};border-radius:999px;background:${colors.surface};font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:11px;line-height:1;letter-spacing:0.22em;text-transform:uppercase;color:${colors.primary};">
                Newsletter Subscription
              </span>
            </td>
          </tr>
          <tr>
            <td style="border:1px solid ${colors.border};border-radius:20px;background:${colors.surface};padding:32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 0 18px;font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:12px;line-height:1.5;letter-spacing:0.22em;text-transform:uppercase;color:${colors.primary};">
                    Confirm your subscription
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px;font-size:30px;line-height:1.15;font-weight:700;color:${colors.text};">
                    Governed AI operations updates, straight to your inbox.
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;font-size:15px;line-height:1.8;color:${colors.textMuted};">
                    You requested the Stagent newsletter for release announcements, product notes, and practical field updates on governed AI agent operations. Confirm your subscription to start receiving new issues.
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;">
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding:0 10px 10px 0;">
                          <span style="display:inline-block;padding:10px 12px;border-radius:999px;border:1px solid ${colors.border};background:${colors.surfaceRaised};font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:11px;line-height:1;letter-spacing:0.14em;text-transform:uppercase;color:${colors.textMuted};">
                            Release Notes
                          </span>
                        </td>
                        <td style="padding:0 10px 10px 0;">
                          <span style="display:inline-block;padding:10px 12px;border-radius:999px;border:1px solid ${colors.border};background:${colors.surfaceRaised};font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:11px;line-height:1;letter-spacing:0.14em;text-transform:uppercase;color:${colors.textMuted};">
                            Product Notes
                          </span>
                        </td>
                        <td style="padding:0 0 10px 0;">
                          <span style="display:inline-block;padding:10px 12px;border-radius:999px;border:1px solid ${colors.border};background:${colors.surfaceRaised};font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:11px;line-height:1;letter-spacing:0.14em;text-transform:uppercase;color:${colors.textMuted};">
                            Field Updates
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding:0 0 24px;">
                    <a
                      href="${confirmUrl}"
                      style="display:inline-block;border-radius:10px;background:${colors.primary};padding:15px 24px;font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:12px;line-height:1.2;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;color:${colors.background};"
                    >
                      Confirm Subscription
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${colors.border};border-radius:14px;background:${colors.surfaceRaised};">
                      <tr>
                        <td style="padding:16px 18px;font-size:12px;line-height:1.7;color:${colors.textDim};">
                          If the button does not work, copy and paste this link into your browser:<br>
                          <a href="${confirmUrl}" style="color:${colors.primaryGlow};text-decoration:none;word-break:break-all;">${confirmUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 0 0;border-top:1px solid ${colors.border};font-size:12px;line-height:1.7;color:${colors.textDim};">
                    This link expires in 7 days. If you did not request Stagent updates, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 12px 0;text-align:center;font-family:'SFMono-Regular','Roboto Mono','JetBrains Mono','Courier New',monospace;font-size:11px;line-height:1.6;letter-spacing:0.08em;color:${colors.textDim};text-transform:uppercase;">
              Stagent • Manav • Local-first oversight
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
