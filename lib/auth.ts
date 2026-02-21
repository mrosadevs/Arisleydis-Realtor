import crypto from "crypto";
import { cookies } from "next/headers";
import { verifyTotpCode } from "@/lib/totp";

const COOKIE_NAME = "aris_admin_session";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "change-this-password";
}

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET ?? "change-this-secret";
}

function getAdminTotpSecret(): string | undefined {
  const secret = process.env.ADMIN_TOTP_SECRET?.trim();
  return secret ? secret : undefined;
}

function getTotpIssuer(): string {
  return process.env.ADMIN_TOTP_ISSUER?.trim() || "Arisleydis Realtor";
}

function getTotpAccount(): string {
  return process.env.ADMIN_TOTP_ACCOUNT?.trim() || "admin@arisleydisrealtor.com";
}

function getSessionToken(): string {
  return crypto
    .createHmac("sha256", getAdminSecret())
    .update(getAdminPassword())
    .digest("hex");
}

export function verifyPassword(password: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const provided = Buffer.from(password);

  if (expected.length !== provided.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}

export function createCookieValue(): string {
  return getSessionToken();
}

export function isAuthenticatedFromCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }

  return cookieValue === getSessionToken();
}

export function isCurrentRequestAuthenticated(): boolean {
  const store = cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  return isAuthenticatedFromCookie(cookie);
}

export function isTotpEnabled(): boolean {
  return Boolean(getAdminTotpSecret());
}

export function verifyTotp(code: string | undefined): boolean {
  const secret = getAdminTotpSecret();

  if (!secret) {
    return true;
  }

  if (!code) {
    return false;
  }

  return verifyTotpCode(secret, code);
}

export function getTotpSetupUri(): string | null {
  const secret = getAdminTotpSecret();

  if (!secret) {
    return null;
  }

  const issuer = getTotpIssuer();
  const account = getTotpAccount();
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(account);

  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}
