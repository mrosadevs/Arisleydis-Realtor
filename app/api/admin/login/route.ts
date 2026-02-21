import { NextResponse } from "next/server";
import { createCookieValue, getAuthCookieName, verifyPassword, verifyTotp } from "@/lib/auth";
import { checkLoginRateLimit, clearLoginFailures, registerLoginFailure } from "@/lib/login-rate-limit";

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const limit = checkLoginRateLimit(identifier);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${limit.retryAfterSeconds} seconds.`
      },
      { status: 429 }
    );
  }

  let body: { password?: string; code?: string };

  try {
    body = (await request.json()) as { password?: string; code?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const passwordOk = verifyPassword(body.password ?? "");
  const totpOk = verifyTotp(body.code);

  if (!passwordOk || !totpOk) {
    const failure = registerLoginFailure(identifier);

    if (failure.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${failure.retryAfterSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  clearLoginFailures(identifier);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getAuthCookieName(),
    value: createCookieValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
