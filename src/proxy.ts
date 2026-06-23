// Next.js 16 "Proxy" (formerly Middleware). Runs before every matched request and
// applies the SITE_PASSWORD gate. All decision logic lives in `lib/siteGate.ts`
// (unit-tested); this file is just the request/response plumbing.
//
// To DISABLE the gate (go fully public): unset the SITE_PASSWORD secret and redeploy.
// See README "Password gate" for the exact commands.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  GATE_COOKIE,
  GATE_QUERY_PARAM,
  siteGateDecision,
} from "@/lib/siteGate";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  const decision = siteGateDecision({
    configuredPassword: password,
    cookieValue: request.cookies.get(GATE_COOKIE)?.value,
    queryValue: request.nextUrl.searchParams.get(GATE_QUERY_PARAM) ?? undefined,
  });

  if (decision.type === "allow") return NextResponse.next();

  if (decision.type === "authorize") {
    // Strip ?key from the URL so the password doesn't linger in history/links,
    // then remember the visitor with a cookie.
    const url = request.nextUrl.clone();
    url.searchParams.delete(GATE_QUERY_PARAM);
    const response = NextResponse.redirect(url);
    response.cookies.set(GATE_COOKIE, password!.trim(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  }

  // prompt: show a minimal password page (GET form re-submits as ?key=...).
  return new NextResponse(gatePage(), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Static asset paths are excluded so the gate doesn't run on every CSS/JS/image
// request; API routes are intentionally INCLUDED so the gate covers them too.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};

function gatePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>GroundTruthAI</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center;
    font-family:ui-sans-serif,system-ui,sans-serif; background:#0b1020; color:#e5e7eb; }
  .card { width:min(92vw,340px); padding:28px; border:1px solid #1f2937;
    border-radius:14px; background:#0f152b; text-align:center; }
  h1 { font-size:18px; margin:0 0 4px; }
  p { font-size:13px; color:#9ca3af; margin:0 0 18px; }
  input { width:100%; box-sizing:border-box; padding:10px 12px; border-radius:8px;
    border:1px solid #334155; background:#020617; color:#e5e7eb; font-size:14px; }
  button { margin-top:10px; width:100%; padding:10px 12px; border:0; border-radius:8px;
    background:#2563eb; color:#fff; font-size:14px; cursor:pointer; }
</style>
</head>
<body>
  <form class="card" method="get">
    <h1>GroundTruthAI</h1>
    <p>This demo is private. Enter the access password to continue.</p>
    <input type="password" name="${GATE_QUERY_PARAM}" placeholder="Password" autofocus aria-label="Access password" />
    <button type="submit">Enter</button>
  </form>
</body>
</html>`;
}
