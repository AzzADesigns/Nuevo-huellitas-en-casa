import Link from "next/link";
import Image from "next/image";
import { getPets } from "@/lib/pet-data";
import Catalog from "./ui";

export const dynamic = "force-dynamic";
export default async function HuellitasPage() {
  const pets = await getPets();
  return <><header className="catalog-head"><Link className="catalog-logo" href="/"><Image src="/images/logo.png" alt="Huellitas en casa" width={92} height={72}/></Link><Link href="/" className="catalog-back">← Volver al inicio</Link><span className="section-kicker">CADA UNO TIENE UNA HISTORIA</span><h1>Amigos que buscan <em>hogar.</em></h1><p>Conocé a quienes esperan compartir la vida con vos.</p></header><Catalog initialPets={pets}/><footer className="site-footer"><div className="footer-bottom"><span>© {new Date().getFullYear()} Huellitas en casa</span><Link href="/">Volver al inicio ↑</Link></div></footer></>;
}
