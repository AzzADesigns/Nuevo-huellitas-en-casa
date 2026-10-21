import { readCollection } from "@/lib/store";
import { getSupabaseAdmin, isSupabaseConfigured, mapPet } from "@/lib/supabase-server";

export async function getPets({ species, search } = {}) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("pets").select("*").eq("is_available", true).order("created_at", { ascending: false });
    if (["Perro", "Gato"].includes(species)) query = query.eq("species", species);
    const term = (search || "").trim().replace(/[,%()[\\]/g, "");
    if (term) query = query.or(["name", "breed", "description"].map((column) => `${column}.ilike.%${term}%`).join(","));
    const { data, error } = await query;
    if (error) throw new Error(`No se pudieron cargar las mascotas: ${error.message}`);
    return data.map((row) => mapPet(row, supabase));
  }
  let pets = await readCollection("pets.json");
  if (["Perro", "Gato"].includes(species)) pets = pets.filter((pet) => pet.species === species);
  const term = (search || "").trim().toLocaleLowerCase("es");
  if (term) pets = pets.filter((pet) => `${pet.name} ${pet.breed} ${pet.description}`.toLocaleLowerCase("es").includes(term));
  return pets;
}
