import { NextResponse } from "next/server";
import { getTotpSetupUri, verifyPassword } from "@/lib/auth";
import { checkLoginRateLimit, registerLoginFailure } from "@/lib/login-rate-limit";

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
      { error: `Too many failed attempts. Try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  let body: { password?: string };

  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const passwordOk = verifyPassword(body.password ?? "");

  if (!passwordOk) {
    const failure = registerLoginFailure(identifier);

    if (failure.locked) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${failure.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const uri = getTotpSetupUri();

  if (!uri) {
    return NextResponse.json({ error: "2FA is not enabled on this environment." }, { status: 400 });
  }

  return NextResponse.json({ uri });
}
