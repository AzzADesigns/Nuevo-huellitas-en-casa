"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Catalog({ initialPets, initialFilters }) {
  const [pets, setPets] = useState(initialPets);
  const [filters, setFilters] = useState(initialFilters || { species: ["Todos"] });
  const [species, setSpecies] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      if (species !== "Todos") params.set("species", species);
      if (query.trim()) params.set("search", query.trim());
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/pets?${params.toString()}`, { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No pudimos cargar las mascotas.");
        setPets(data.pets || []);
        setFilters(data.filters || { species: ["Todos"] });
      } catch (issue) {
        if (issue.name !== "AbortError") setError(issue.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query.trim() ? 220 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [species, query]);

  return <main className="catalog-main">
    <div className="catalog-tools">
      <div className="catalog-filters" aria-label="Filtrar por especie">{(filters.species || ["Todos"]).map((item) => <button type="button" key={item} aria-pressed={species === item} className={species === item ? "selected" : ""} onClick={() => setSpecies(item)}>{item}</button>)}</div>
      <input aria-label="Buscar por nombre o raza" placeholder="Buscar por nombre o raza" value={query} onChange={(event) => setQuery(event.target.value)}/>
    </div>
    {error && <p className="catalog-error" role="alert">{error}</p>}
    {loading && <p className="catalog-loading" role="status">Buscando huellitas…</p>}
    <section className="catalog-grid">{pets.map((pet, index) => <button className="catalog-card" key={pet.id} onClick={() => setSelected(pet)}><img src={pet.imageUrl || pet.image} alt={pet.name} loading="lazy"/><span className="catalog-card-number">{String(index + 1).padStart(2, "0")} · {pet.species}</span><span className="catalog-card-copy"><b>{pet.name}</b><small>{pet.breed} · {pet.age} {pet.age === 1 ? "año" : "años"}</small></span></button>)}</section>
    {!loading && !pets.length && <div className="catalog-empty"><h2>No encontramos esa huellita.</h2><p>Probá con otro nombre o filtro.</p></div>}
    {selected && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="pet-modal" role="dialog" aria-modal="true" aria-label={`Información de ${selected.name}`}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button><div className="modal-photo"><img src={selected.imageUrl || selected.image} alt={selected.name}/></div><div className="modal-info"><span className="section-kicker">UNA NUEVA HISTORIA</span><h2>Hola, soy <em>{selected.name}</em></h2><p className="modal-breed">{selected.breed} · {selected.species}</p><p>{selected.description}</p><div className="modal-facts"><span>Edad <b>{selected.age} {selected.age === 1 ? "año" : "años"}</b></span><span>Género <b>{selected.gender}</b></span><span>Tamaño <b>{selected.size}</b></span><span>Salud <b>{selected.health}</b></span></div><Link className="submit-button" href="/#mascotas">Conoceme más <span>→</span></Link></div></section></div>}
  </main>;
}
