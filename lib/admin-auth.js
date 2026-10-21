import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "huellitas_admin";

export function verifyAdminCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedEmail || !expectedPassword) return false;
  const safeEqual = (left, right) => {
    const a = Buffer.from(String(left));
    const b = Buffer.from(String(right));
    return a.length === b.length && timingSafeEqual(a, b);
  };
  return safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) && safeEqual(password, expectedPassword);
}

export function createAdminToken() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("Falta configurar ADMIN_SECRET.");
  const payload = Buffer.from(JSON.stringify({ role: "ADMIN", exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isAdminTokenValid(token) {
  try {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || !token) return false;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "ADMIN" && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(request) {
  return isAdminTokenValid(request.cookies.get(ADMIN_COOKIE)?.value);
}
