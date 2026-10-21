import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Configurá SUPABASE_URL y SUPABASE_SECRET_KEY en .env.local primero.");

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const bucket = process.env.SUPABASE_BUCKET || "pet-images";
const seed = [
  { name: "Firulais", species: "Perro", breed: "Labrador", age: 3, gender: "Macho", size: "Mediano", description: "Un perro juguetón que ama correr en el parque.", health_status: "Sano", file: "perro1.jpg" },
  { name: "Mishi", species: "Gato", breed: "Persa", age: 2, gender: "Hembra", size: "Pequeño", description: "Gata tranquila que disfruta dormir al sol.", health_status: "Sana", file: "gato2.jpg" },
  { name: "Lola", species: "Gato", breed: "Mestiza", age: 1, gender: "Hembra", size: "Pequeño", description: "Gatita curiosa y muy cariñosa.", health_status: "Sana", file: "gato3.jpg" },
  { name: "Rocky", species: "Perro", breed: "Pastor alemán", age: 4, gender: "Macho", size: "Grande", description: "Un compañero leal que disfruta los paseos y los juegos.", health_status: "Sano", file: "perro5.jpg" },
];

const { data: existing, error: checkError } = await supabase.from("pets").select("id").limit(1);
if (checkError) throw new Error(`No se pudo comprobar la tabla pets: ${checkError.message}`);
if (existing.length) throw new Error("La tabla pets ya tiene registros; el seed se cancela para no duplicar datos.");

for (const pet of seed) {
  const contents = await readFile(path.join(process.cwd(), "public", "images", pet.file));
  const imagePath = `seed/${pet.file}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(imagePath, contents, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error(`No se pudo subir ${pet.file}: ${uploadError.message}`);
  const record = { ...pet };
  delete record.file;
  const { error: insertError } = await supabase.from("pets").insert({ ...record, image_path: imagePath });
  if (insertError) throw new Error(`No se pudo guardar ${pet.name}: ${insertError.message}`);
  console.log(`Cargada: ${pet.name}`);
}
