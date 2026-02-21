import { NextResponse } from "next/server";
import { isCurrentRequestAuthenticated, isTotpEnabled } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    authenticated: isCurrentRequestAuthenticated(),
    totpEnabled: isTotpEnabled()
  });
}
