import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken, isAdminRequest, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) }, { status: isAdminRequest(request) ? 200 : 401 });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Completá el correo y la contraseña." }, { status: 400 }); }
  if (!verifyAdminCredentials(body.email || "", body.password || "")) {
    return NextResponse.json({ error: "El correo o la contraseña no son correctos." }, { status: 401 });
  }
  let token;
  try { token = createAdminToken(); } catch { return NextResponse.json({ error: "Falta configurar el acceso de administración en .env.local." }, { status: 503 }); }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
