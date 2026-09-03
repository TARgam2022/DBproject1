import { SignJWT, jwtVerify, type JWTVerifyResult } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: {
  userId: number;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<{ userId: number; email: string; role: string } | null> {
  try {
    const { payload } = (await jwtVerify(token, secret)) as JWTVerifyResult<{
      userId: number;
      email: string;
      role: string;
    }>;
    return { userId: payload.userId, email: payload.email, role: payload.role ?? "user" };
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "auth_token";

export function getCookieValue(name: string, cookieHeader?: string | null) {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
