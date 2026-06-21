import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "sozo_barista";

function secret() {
  const value = process.env.BARISTA_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("BARISTA_SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function verifyPin(pin: string) {
  const hash = process.env.BARISTA_PIN_HASH;
  if (!hash) throw new Error("BARISTA_PIN_HASH is not configured.");
  return bcrypt.compare(pin, hash);
}

export async function createBaristaSession() {
  const token = await new SignJWT({ role: "barista" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
}

export async function isBarista() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "barista";
  } catch {
    return false;
  }
}

export async function clearBaristaSession() {
  (await cookies()).delete(COOKIE_NAME);
}
