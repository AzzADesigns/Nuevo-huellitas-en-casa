import AdoptionApp from "./ui";
import { getPets } from "@/lib/pet-data";

export const dynamic = "force-dynamic";
export default async function Home() {
  const pets = await getPets();
  return <AdoptionApp initialPets={pets} />;
}
