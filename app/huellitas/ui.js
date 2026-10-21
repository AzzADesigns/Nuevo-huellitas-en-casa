"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Catalog({ initialPets }) {
  const [pets, setPets] = useState(initialPets);
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "Todos") params.set("species", filter);
    if (query.trim()) params.set("search", query.trim());
    const controller = new AbortController();
    fetch("/api/pets?" + params.toString(), { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setPets(data.pets || []))
      .catch((error) => { if (error.name !== "AbortError") console.error("No se pudo cargar el catálogo", error); });
    return () => controller.abort();
  }, [filter, query]);
  const results = pets;
  return <main className="catalog-main"><div className="catalog-tools"><div className="catalog-filters">{["Todos","Perro","Gato"].map((item)=><button key={item} className={filter===item?"selected":""} onClick={()=>setFilter(item)}>{item}</button>)}</div><input aria-label="Buscar por nombre o raza" placeholder="Buscar por nombre o raza" value={query} onChange={(event)=>setQuery(event.target.value)}/></div>
    <section className="catalog-grid">{results.map((pet,index)=><button className="catalog-card" key={pet.id} onClick={()=>setSelected(pet)}><Image src={pet.image||"/images/perro1.jpg"} alt={pet.name} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"/><span className="catalog-card-number">0{index+1} · {pet.species}</span><span className="catalog-card-copy"><b>{pet.name}</b><small>{pet.breed} · {pet.age} {pet.age===1?"año":"años"}</small></span></button>)}</section>
    {!results.length&&<div className="catalog-empty"><h2>No encontramos esa huellita.</h2><p>Probá con otro nombre o filtro.</p></div>}
    {selected&&<div className="modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSelected(null)}}><section className="pet-modal" role="dialog" aria-modal="true" aria-label={"Información de "+selected.name}><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Cerrar">×</button><div className="modal-photo"><Image src={selected.image||"/images/perro1.jpg"} alt={selected.name} width={500} height={500} sizes="(max-width: 600px) 100vw, 40vw"/></div><div className="modal-info"><span className="section-kicker">UNA NUEVA HISTORIA</span><h2>Hola, soy <em>{selected.name}</em></h2><p>{selected.description}</p><div className="modal-facts"><span>Edad <b>{selected.age} años</b></span><span>Género <b>{selected.gender}</b></span><span>Salud <b>{selected.health}</b></span></div><Link className="submit-button" href="/#mascotas">Conoceme más <span>→</span></Link></div></section></div>}
  </main>;
}
