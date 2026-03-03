import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return htmlResponse(errorPage("Method not allowed"), 405);
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return htmlResponse(errorPage("Invalid confirmation link."), 400);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up by token
    const { data: row, error: selectError } = await supabase
      .from("waitlist")
      .select("id, email, confirmed")
      .eq("confirm_token", token)
      .maybeSingle();

    if (selectError) {
      console.error("Select error:", selectError);
      return htmlResponse(errorPage("Something went wrong. Please try again."), 500);
    }

    if (!row) {
      return htmlResponse(
        errorPage("This link has expired or was already used."),
        404,
      );
    }

    if (row.confirmed) {
      return htmlResponse(successPage(row.email, true));
    }

    // Confirm the signup
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({
        confirmed: true,
        confirm_token: null,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return htmlResponse(errorPage("Something went wrong. Please try again."), 500);
    }

    return htmlResponse(successPage(row.email, false));
  } catch (err) {
    console.error("Unhandled error:", err);
    return htmlResponse(errorPage("Something went wrong. Please try again."), 500);
  }
});

function successPage(email: string, alreadyConfirmed: boolean): string {
  const heading = alreadyConfirmed
    ? "Already confirmed"
    : "Thank you";
  const message = alreadyConfirmed
    ? `<strong style="color:#e8e4df;">${email}</strong> is already confirmed on the Stagent waitlist.`
    : `<strong style="color:#e8e4df;">${email}</strong> is confirmed. We'll notify you when Stagent is ready to launch.`;

  return basePage(`
    <div style="width:48px;height:48px;border-radius:50%;background:#4db8a420;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4db8a4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h1 style="font-family:monospace;font-size:20px;letter-spacing:0.15em;color:#e8e4df;margin:0 0 16px;text-transform:uppercase;">${heading}</h1>
    <p style="color:#b0aaa4;font-size:15px;line-height:1.7;margin:0 0 32px;">${message}</p>
    <div style="display:flex;flex-direction:column;gap:12px;align-items:center;">
      <a href="https://stagent.io"
         style="display:inline-block;font-family:monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#0a0a0a;background:#d4a843;padding:12px 28px;text-decoration:none;">
        Back to Stagent
      </a>
      <a href="https://stagent.io/research"
         style="display:inline-block;font-family:monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d4a843;border:1px solid rgba(212,168,67,0.4);padding:12px 28px;text-decoration:none;">
        Read the Research Paper
      </a>
    </div>
  `);
}

function errorPage(message: string): string {
  return basePage(`
    <div style="width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </div>
    <h1 style="font-family:monospace;font-size:20px;letter-spacing:0.15em;color:#e8e4df;margin:0 0 16px;text-transform:uppercase;">Oops</h1>
    <p style="color:#b0aaa4;font-size:15px;line-height:1.7;margin:0 0 32px;">${message}</p>
    <a href="https://stagent.io"
       style="display:inline-block;font-family:monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#d4a843;border:1px solid rgba(212,168,67,0.4);padding:12px 28px;text-decoration:none;">
      Back to Stagent
    </a>
  `);
}

function basePage(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Stagent Waitlist</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap');
    body {
      margin: 0;
      background: #0a0a0a;
      font-family: 'DM Sans', system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
  </style>
</head>
<body>
  <div style="max-width:420px;text-align:center;">
    ${content}
  </div>
</body>
</html>`;
}
