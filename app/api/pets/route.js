import { NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/store";
import { getPetCatalog } from "@/lib/pet-data";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured, mapPet } from "@/lib/supabase-server";
import { toDatabasePet, validatePetInput } from "@/lib/pet-validation";

export const runtime = "nodejs";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const includeUnavailable = params.get("includeUnavailable") === "1";
  if (includeUnavailable && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  }

  try {
    const catalog = await getPetCatalog({
      species: params.get("species")?.trim(),
      search: params.get("search")?.trim(),
      includeUnavailable,
    });
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json({ error: error.message || "No se pudo cargar el catálogo." }, { status: 502 });
  }
}

export async function POST(request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Se requiere acceso de administración." }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "El formulario no es válido." }, { status: 400 }); }
  const { value, error: validationError } = validatePetInput(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("pets").insert({ ...toDatabasePet(value), is_available: true }).select().single();
    if (error) return NextResponse.json({ error: `No se pudo guardar la mascota: ${error.message}` }, { status: 502 });
    return NextResponse.json({ pet: mapPet(data, supabase) }, { status: 201 });
  }

  const pets = await readCollection("pets.json");
  const pet = { id: crypto.randomUUID(), ...value, image: value.imageUrl, isAvailable: true, createdAt: new Date().toISOString() };
  pets.unshift(pet);
  await writeCollection("pets.json", pets);
  return NextResponse.json({ pet }, { status: 201 });
}
