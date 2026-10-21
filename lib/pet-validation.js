const SPECIES = ["Perro", "Gato"];
const GENDERS = ["Hembra", "Macho"];
const SIZES = ["Pequeño", "Mediano", "Grande"];

export function validatePetInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "El formulario no es válido." };
  const age = Number(body.age);
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  let parsedImageUrl;
  try { parsedImageUrl = new URL(imageUrl); } catch { /* handled below */ }

  const fields = [body.name, body.species, body.breed, body.gender, body.size, body.description];
  const health = typeof body.health === "string" && body.health.trim() ? body.health.trim() : "A confirmar";
  if (!fields.every((value) => typeof value === "string" && value.trim()) ||
      !SPECIES.includes(body.species) || !GENDERS.includes(body.gender) || !SIZES.includes(body.size) ||
      !Number.isInteger(age) || age < 0 || age > 30 ||
      body.name.trim().length > 80 || body.breed.trim().length > 120 ||
      body.description.trim().length > 1200 || health.length > 120 || imageUrl.length > 2048 ||
      !parsedImageUrl || parsedImageUrl.protocol !== "https:" || parsedImageUrl.username || parsedImageUrl.password) {
    return { error: "Revisá los campos. La imagen debe tener una URL HTTPS pública." };
  }

  return {
    value: {
      name: body.name.trim(), species: body.species, breed: body.breed.trim(), age,
      gender: body.gender, size: body.size, description: body.description.trim(),
      health, imageUrl: parsedImageUrl.toString(),
    },
  };
}

export function toDatabasePet(pet) {
  return {
    name: pet.name, species: pet.species, breed: pet.breed, age: pet.age,
    gender: pet.gender, size: pet.size, description: pet.description,
    health_status: pet.health, image_url: pet.imageUrl,
  };
}
