import { NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/store";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured, mapPet } from "@/lib/supabase-server";
import { toDatabasePet, validatePetInput } from "@/lib/pet-validation";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  const { id } = await params;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "El formulario no es válido." }, { status: 400 }); }

  if (typeof body.isAvailable === "boolean" && Object.keys(body).length === 1) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("pets").update({ is_available: body.isAvailable, updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
      if (error) return NextResponse.json({ error: `No se pudo actualizar la disponibilidad: ${error.message}` }, { status: 502 });
      if (!data) return NextResponse.json({ error: "No encontramos esa mascota." }, { status: 404 });
      return NextResponse.json({ pet: mapPet(data, supabase) });
    }

    const pets = await readCollection("pets.json");
    const index = pets.findIndex((pet) => pet.id === id);
    if (index < 0) return NextResponse.json({ error: "No encontramos esa mascota." }, { status: 404 });
    pets[index] = { ...pets[index], isAvailable: body.isAvailable };
    await writeCollection("pets.json", pets);
    return NextResponse.json({ pet: pets[index] });
  }

  const { value, error: validationError } = validatePetInput(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("pets").update({ ...toDatabasePet(value), updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
    if (error) return NextResponse.json({ error: `No se pudo actualizar la mascota: ${error.message}` }, { status: 502 });
    if (!data) return NextResponse.json({ error: "No encontramos esa mascota." }, { status: 404 });
    return NextResponse.json({ pet: mapPet(data, supabase) });
  }

  const pets = await readCollection("pets.json");
  const index = pets.findIndex((pet) => pet.id === id);
  if (index < 0) return NextResponse.json({ error: "No encontramos esa mascota." }, { status: 404 });
  pets[index] = { ...pets[index], ...value, image: value.imageUrl };
  await writeCollection("pets.json", pets);
  return NextResponse.json({ pet: pets[index] });
}
