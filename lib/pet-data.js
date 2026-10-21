import { readCollection } from "@/lib/store";
import { getSupabaseAdmin, isSupabaseConfigured, mapPet } from "@/lib/supabase-server";

const SPECIES = ["Perro", "Gato"];

function matchesSearch(pet, term) {
  if (!term) return true;
  return `${pet.name} ${pet.breed}`.toLocaleLowerCase("es").includes(term);
}

function createFilters(pets) {
  return {
    species: ["Todos", ...new Set(pets.map((pet) => pet.species).filter((value) => SPECIES.includes(value)))],
  };
}

export async function getPetCatalog({ species, search, includeUnavailable = false } = {}) {
  let allPets;
  let filteredPets;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    let allQuery = supabase.from("pets").select("species").limit(1000);
    let filteredQuery = supabase.from("pets").select("*").order("created_at", { ascending: false }).limit(1000);
    if (!includeUnavailable) {
      allQuery = allQuery.eq("is_available", true);
      filteredQuery = filteredQuery.eq("is_available", true);
    }
    if (SPECIES.includes(species)) filteredQuery = filteredQuery.eq("species", species);
    const term = (search || "").trim().slice(0, 80).replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
    if (term) filteredQuery = filteredQuery.or(`name.ilike.%${term}%,breed.ilike.%${term}%`);

    const [{ data: allRows, error: allError }, { data: rows, error }] = await Promise.all([allQuery, filteredQuery]);
    if (allError) throw new Error(`No se pudieron cargar los filtros: ${allError.message}`);
    if (error) throw new Error(`No se pudieron cargar las mascotas: ${error.message}`);
    allPets = allRows;
    filteredPets = rows.map((row) => mapPet(row, supabase));
  } else {
    allPets = await readCollection("pets.json");
    if (!includeUnavailable) allPets = allPets.filter((pet) => pet.isAvailable !== false);
    const term = (search || "").trim().slice(0, 80).toLocaleLowerCase("es");
    filteredPets = allPets.filter((pet) => (!SPECIES.includes(species) || pet.species === species) && matchesSearch(pet, term));
  }

  return { pets: filteredPets, filters: createFilters(allPets) };
}

export async function getPets(options = {}) {
  return (await getPetCatalog(options)).pets;
}
