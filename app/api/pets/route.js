import { NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/store";
import { getPets } from "@/lib/pet-data";
import { getSupabaseAdmin, isSupabaseConfigured, mapPet } from "@/lib/supabase-server";

export const runtime = "nodejs";
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const pets = await getPets({ species: params.get("species")?.trim(), search: params.get("search")?.trim() });
  return NextResponse.json({ pets });
}
export async function POST(request) {
  let body;
  let imageFile = null;
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
      imageFile = form.get("image");
    } else body = await request.json();
  } catch { return NextResponse.json({ error: "El formulario no es válido." }, { status: 400 }); }
  const { name, species, breed, age, gender, size, description, image, health } = body;
  if (![name, species, breed, gender, size, description].every((value) => typeof value === "string" && value.trim()) || !["Perro", "Gato"].includes(species) || !Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 30) {
    return NextResponse.json({ error: "Completá los datos requeridos con valores válidos." }, { status: 400 });
  }
  if (isSupabaseConfigured()) {
    if (!(imageFile instanceof File) || !imageFile.size) return NextResponse.json({ error: "Subí una foto para publicar la mascota." }, { status: 400 });
    if (!imageFile.type.startsWith("image/") || imageFile.size > 5 * 1024 * 1024) return NextResponse.json({ error: "La foto debe ser una imagen de hasta 5 MB." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const extension = imageFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const imagePath = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(process.env.SUPABASE_BUCKET || "pet-images").upload(imagePath, imageFile, { contentType: imageFile.type, upsert: false });
    if (uploadError) return NextResponse.json({ error: `No se pudo subir la imagen: ${uploadError.message}` }, { status: 502 });
    const { data, error } = await supabase.from("pets").insert({ name: name.trim(), species, breed: breed.trim(), age: Number(age), gender, size, description: description.trim(), health_status: typeof health === "string" && health.trim() ? health.trim() : "A confirmar", image_path: imagePath }).select().single();
    if (error) {
      await supabase.storage.from(process.env.SUPABASE_BUCKET || "pet-images").remove([imagePath]);
      return NextResponse.json({ error: `No se pudo guardar la mascota: ${error.message}` }, { status: 502 });
    }
    return NextResponse.json({ pet: mapPet(data, supabase) }, { status: 201 });
  }
  const pets = await readCollection("pets.json");
  const pet = { id: crypto.randomUUID(), name: name.trim(), species, breed: breed.trim(), age: Number(age), gender, size, description: description.trim(), image: typeof image === "string" && image.startsWith("/images/") ? image : species === "Gato" ? "/images/gato1.jpg" : "/images/perro1.jpg", health: typeof health === "string" && health.trim() ? health.trim() : "A confirmar", createdAt: new Date().toISOString().slice(0, 10) };
  pets.unshift(pet);
  await writeCollection("pets.json", pets);
  return NextResponse.json({ pet }, { status: 201 });
}
