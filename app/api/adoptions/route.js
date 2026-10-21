import { NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/store";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase-server";

export const runtime = "nodejs";
export async function GET(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin().from("adoption_applications").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: `No se pudieron cargar las solicitudes: ${error.message}` }, { status: 502 });
    return NextResponse.json({ adoptions: data.map((item) => ({ id: item.id, petId: item.pet_id, petName: item.pet_name, name: item.applicant_name, email: item.email, phone: item.phone, message: item.message, status: item.status, createdAt: item.created_at })) });
  }
  return NextResponse.json({ adoptions: await readCollection("adoptions.json") });
}
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "El formulario no es válido." }, { status: 400 }); }
  const { petId, name, email, phone, message } = body;
  if (![petId, name, email, phone].every((value) => typeof value === "string" && value.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Completá nombre, correo válido y teléfono." }, { status: 400 });
  }
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data: pet, error: petError } = await supabase.from("pets").select("id,name,is_available").eq("id", petId).eq("is_available", true).maybeSingle();
    if (petError || !pet) return NextResponse.json({ error: "Esta mascota ya no está disponible." }, { status: 404 });
    const { data, error } = await supabase.from("adoption_applications").insert({ pet_id: pet.id, pet_name: pet.name, applicant_name: name.trim(), email: email.trim(), phone: phone.trim(), message: typeof message === "string" ? message.trim() : "" }).select().single();
    if (error) return NextResponse.json({ error: `No se pudo guardar la solicitud: ${error.message}` }, { status: 502 });
    return NextResponse.json({ application: { id: data.id, petId: data.pet_id, petName: data.pet_name, name: data.applicant_name, email: data.email, phone: data.phone, message: data.message, status: data.status, createdAt: data.created_at } }, { status: 201 });
  }
  const pets = await readCollection("pets.json");
  const pet = pets.find(({ id }) => id === petId);
  if (!pet) return NextResponse.json({ error: "Esta mascota ya no está disponible." }, { status: 404 });
  const applications = await readCollection("adoptions.json");
  const application = { id: crypto.randomUUID(), petId, petName: pet.name, name: name.trim(), email: email.trim(), phone: phone.trim(), message: typeof message === "string" ? message.trim() : "", status: "Pendiente", createdAt: new Date().toISOString() };
  applications.unshift(application);
  await writeCollection("adoptions.json", applications);
  return NextResponse.json({ application }, { status: 201 });
}
