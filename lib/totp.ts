import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(input: string): Buffer | null {
  const normalized = input.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");

  if (!normalized) {
    return null;
  }

  let bits = "";

  for (const char of normalized) {
    const value = BASE32_ALPHABET.indexOf(char);

    if (value === -1) {
      return null;
    }

    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateHotp(secret: Buffer, counter: number, digits: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 10 ** digits;
  return otp.toString().padStart(digits, "0");
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  const normalizedCode = code.replace(/\D/g, "");

  if (normalizedCode.length !== 6) {
    return false;
  }

  const secret = decodeBase32(secretBase32);

  if (!secret) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / 30);

  for (let offset = -1; offset <= 1; offset += 1) {
    const expected = generateHotp(secret, currentCounter + offset, 6);

    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalizedCode))) {
      return true;
    }
  }

  return false;
}
