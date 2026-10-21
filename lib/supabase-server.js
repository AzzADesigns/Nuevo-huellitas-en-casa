import { createClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function mapPet(row, supabase = null) {
  const legacyImage = row.image_path && supabase
    ? supabase.storage.from(process.env.SUPABASE_BUCKET || "pet-images").getPublicUrl(row.image_path).data.publicUrl
    : "";
  return {
    id: row.id, name: row.name, species: row.species, breed: row.breed,
    age: row.age, gender: row.gender, size: row.size, description: row.description,
    health: row.health_status || row.health || "A confirmar", image: row.image_url || row.image || legacyImage,
    imageUrl: row.image_url || row.image || legacyImage,
    isAvailable: row.is_available ?? row.isAvailable ?? true,
    createdAt: row.created_at || row.createdAt,
  };
}
