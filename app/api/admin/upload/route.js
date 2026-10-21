import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

export const runtime = "nodejs";

const ALLOWED_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };
const MAX_BYTES = 5 * 1024 * 1024;

async function ensureBucket(supabase, bucket) {
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return;
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: Object.keys(ALLOWED_TYPES),
  });
  if (error && !/already exists/i.test(error.message)) throw error;
}

// Devuelve una URL firmada para que el navegador suba la imagen directo a Supabase Storage.
export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase no está configurado (faltan SUPABASE_URL o SUPABASE_SECRET_KEY)." }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const extension = ALLOWED_TYPES[body?.contentType];
  if (!extension) return NextResponse.json({ error: "Formato no permitido. Usá JPG, PNG, WEBP, AVIF o GIF." }, { status: 400 });
  if (!Number.isFinite(body.size) || body.size <= 0 || body.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen debe pesar menos de 5 MB." }, { status: 400 });
  }

  const bucket = process.env.SUPABASE_BUCKET || "pet-images";
  const path = `pets/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  try {
    const supabase = getSupabaseAdmin();
    await ensureBucket(supabase, bucket);
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw error;
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ uploadUrl: data.signedUrl, publicUrl });
  } catch (error) {
    return NextResponse.json({ error: `No se pudo preparar la subida: ${error.message}` }, { status: 502 });
  }
}
