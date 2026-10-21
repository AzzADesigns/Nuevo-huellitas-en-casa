import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { readCollection, writeCollection } from "@/lib/store";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  const { id } = await params;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 }); }
  if (!["Aprobada", "Rechazada"].includes(body.status)) return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin().from("adoption_applications").update({ status: body.status, reviewed_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
    if (error) return NextResponse.json({ error: `No se pudo actualizar la solicitud: ${error.message}` }, { status: 502 });
    if (!data) return NextResponse.json({ error: "No encontramos esa solicitud." }, { status: 404 });
    return NextResponse.json({ application: { id: data.id, petId: data.pet_id, petName: data.pet_name, name: data.applicant_name, email: data.email, phone: data.phone, message: data.message, status: data.status, createdAt: data.created_at } });
  }
  const applications = await readCollection("adoptions.json");
  const index = applications.findIndex((application) => application.id === id);
  if (index < 0) return NextResponse.json({ error: "No encontramos esa solicitud." }, { status: 404 });
  applications[index] = { ...applications[index], status: body.status, reviewedAt: new Date().toISOString() };
  await writeCollection("adoptions.json", applications);
  return NextResponse.json({ application: applications[index] });
}
