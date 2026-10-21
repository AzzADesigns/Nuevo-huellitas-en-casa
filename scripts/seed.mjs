// Carga las mascotas de data/pets.json en Supabase.
// - Sube cada imagen local (public/...) al bucket de Storage.
// - Guarda el link público en pets.image_url.
// - Se puede correr varias veces: si la mascota ya existe (mismo nombre y especie) la actualiza.
//
// Uso:  npm run seed            (carga de verdad)
//       npm run seed -- --dry   (solo muestra lo que haría)
import { readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Lee .env.local (sin pisar variables que ya estén definidas).
const envFile = path.join(process.cwd(), ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

const DRY = process.argv.includes("--dry");
const root = process.cwd();
const bucket = process.env.SUPABASE_BUCKET || "pet-images";
const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif" };

function slug(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const pets = JSON.parse(await readFile(path.join(root, "data", "pets.json"), "utf8"));
  console.log(`Encontré ${pets.length} mascotas en data/pets.json${DRY ? " (modo prueba, no se sube nada)" : ""}.\n`);

  if (!DRY && (!url || !key)) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local.");
  }
  const supabase = DRY ? null : createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  if (!DRY) {
    const { data: existing } = await supabase.storage.getBucket(bucket);
    if (!existing) {
      const { error } = await supabase.storage.createBucket(bucket, { public: true });
      if (error && !/already exists/i.test(error.message)) throw new Error(`No pude crear el bucket "${bucket}": ${error.message}`);
      console.log(`Bucket "${bucket}" creado.`);
    }
  }

  let ok = 0;
  for (const pet of pets) {
    const label = `${pet.name} (${pet.species})`;
    try {
      const source = pet.imageUrl || pet.image || "";
      let imageUrl = source;

      if (!/^https:\/\//.test(source)) {
        const localPath = path.join(root, "public", source.replace(/^\/+/, ""));
        const ext = path.extname(localPath).toLowerCase();
        const contentType = MIME[ext];
        if (!contentType) throw new Error(`formato de imagen no soportado: ${source}`);
        const file = await readFile(localPath);
        const storagePath = `seed/${slug(pet.id || pet.name)}${ext}`;

        if (DRY) {
          imageUrl = `(se subiría a ${bucket}/${storagePath}, ${(file.length / 1024 / 1024).toFixed(1)} MB)`;
        } else {
          const { error } = await supabase.storage.from(bucket).upload(storagePath, file, { contentType, upsert: true, cacheControl: "31536000" });
          if (error) throw new Error(`no pude subir la imagen: ${error.message}`);
          imageUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
        }
      }

      const row = {
        name: pet.name, species: pet.species, breed: pet.breed, age: Number(pet.age),
        gender: pet.gender, size: pet.size, description: pet.description,
        health_status: pet.health || "A confirmar", image_url: imageUrl,
        is_available: pet.isAvailable !== false,
      };

      if (DRY) { console.log(`• ${label} → ${imageUrl}`); ok++; continue; }

      const { data: found, error: findError } = await supabase.from("pets").select("id").eq("name", row.name).eq("species", row.species).limit(1).maybeSingle();
      if (findError) throw new Error(findError.message);

      if (found) {
        const { error } = await supabase.from("pets").update({ ...row, updated_at: new Date().toISOString() }).eq("id", found.id);
        if (error) throw new Error(error.message);
        console.log(`↻ ${label} actualizada`);
      } else {
        const { error } = await supabase.from("pets").insert(row);
        if (error) throw new Error(error.message);
        console.log(`✓ ${label} creada`);
      }
      ok++;
    } catch (error) {
      console.error(`✗ ${label}: ${error.message}`);
    }
  }

  console.log(`\nListo: ${ok}/${pets.length} mascotas cargadas.`);
  if (ok < pets.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  if (/relation .*pets.* does not exist|Could not find the table/i.test(error.message)) {
    console.error("Primero ejecutá supabase/schema.sql en el SQL Editor de Supabase.");
  }
  process.exit(1);
});
