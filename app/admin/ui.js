"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const emptyPet = {
  name: "", species: "Perro", breed: "", age: "", gender: "Hembra", size: "Mediano",
  health: "", description: "", imageUrl: "",
};

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [applications, setApplications] = useState([]);
  const [pets, setPets] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("pets");
  const [editingPet, setEditingPet] = useState(null);
  const [petForm, setPetForm] = useState(emptyPet);

  const loadApplications = useCallback(async () => {
    const response = await fetch("/api/adoptions", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No pudimos cargar las solicitudes.");
    setApplications(data.adoptions || []);
  }, []);

  const loadPets = useCallback(async () => {
    const response = await fetch("/api/pets?includeUnavailable=1", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No pudimos cargar las mascotas.");
    setPets(data.pets || []);
  }, []);

  const loadDashboard = useCallback(async () => {
    await Promise.all([loadPets(), loadApplications()]);
  }, [loadApplications, loadPets]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        if (active) setAuthenticated(true);
        await loadDashboard();
      })
      .catch((issue) => { if (active) setError(issue.message); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadDashboard]);

  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos iniciar sesión.");
      setAuthenticated(true); setPassword(""); await loadDashboard();
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  async function savePet(event) {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(editingPet ? `/api/pets/${editingPet.id}` : "/api/pets", {
        method: editingPet ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos guardar la mascota.");
      await loadPets();
      setPetForm(emptyPet); setEditingPet(null);
      setSuccess(editingPet ? "Actualizamos la ficha." : "La mascota ya está publicada.");
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  function editPet(pet) {
    setTab("pets"); setEditingPet(pet);
    setPetForm({ name: pet.name, species: pet.species, breed: pet.breed, age: String(pet.age), gender: pet.gender, size: pet.size, health: pet.health || "", description: pet.description, imageUrl: pet.imageUrl || pet.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleAvailability(pet) {
    setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/pets/${pet.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !pet.isAvailable }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos cambiar la disponibilidad.");
      setPets((current) => current.map((item) => item.id === pet.id ? data.pet : item));
      setSuccess(data.pet.isAvailable ? "La mascota volvió a estar disponible." : "La mascota quedó pausada.");
    } catch (issue) { setError(issue.message); }
  }

  async function updateStatus(id, status) {
    setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/adoptions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos actualizar la solicitud.");
      setApplications((current) => current.map((item) => item.id === id ? data.application : item));
    } catch (issue) { setError(issue.message); }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false); setApplications([]); setPets([]);
  }

  if (checking) return <main className="admin-login"><p>Preparando el panel…</p></main>;
  if (!authenticated) return <main className="admin-login"><form onSubmit={signIn}><Link href="/" className="catalog-back">← Volver al sitio</Link><span className="section-kicker">HUELLITAS EN CASA</span><h1>Panel de administración</h1><p>Ingresá con las credenciales configuradas para el refugio.</p>{error && <p className="admin-error" role="alert">{error}</p>}<label>Correo<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></label><button disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button></form></main>;

  return <main className="admin-page">
    <header className="admin-top"><Link href="/">← Huellitas en casa</Link><h1>Administración</h1><button onClick={signOut}>Cerrar sesión</button></header>
    <section className="admin-title"><span className="section-kicker">PANEL DEL REFUGIO</span><h2>Hola, qué bueno verte.</h2><p>Administrá las fichas y acompañá cada solicitud de adopción.</p></section>
    <div className="admin-summary"><article><span>Mascotas disponibles</span><b>{pets.filter((pet) => pet.isAvailable).length}</b></article><article><span>Fichas totales</span><b>{pets.length}</b></article><article><span>Solicitudes pendientes</span><b>{applications.filter((item) => item.status === "Pendiente").length}</b></article></div>
    <nav className="admin-tabs" aria-label="Secciones del panel"><button className={tab === "pets" ? "active" : ""} onClick={() => { setTab("pets"); setError(""); }}>Mascotas <span>{pets.length}</span></button><button className={tab === "applications" ? "active" : ""} onClick={() => { setTab("applications"); setError(""); }}>Solicitudes <span>{applications.length}</span></button></nav>
    {error && <p className="admin-error admin-feedback" role="alert">{error}</p>}{success && <p className="admin-success admin-feedback" role="status">{success}</p>}

    {tab === "pets" ? <>
      <section className="pet-editor"><div className="pet-editor-heading"><div><span className="section-kicker">FICHAS DE ADOPCIÓN</span><h2>{editingPet ? `Editar a ${editingPet.name}` : "Sumar una mascota"}</h2><p>La imagen se guarda como URL en la base de datos; no subimos archivos al servidor.</p></div>{editingPet && <button className="admin-cancel" type="button" onClick={() => { setEditingPet(null); setPetForm(emptyPet); }}>Cancelar edición</button>}</div>
        <form className="pet-editor-form" onSubmit={savePet}>
          <label>Nombre<input name="name" required maxLength="80" value={petForm.name} onChange={(event) => setPetForm({ ...petForm, name: event.target.value })} placeholder="Nombre de la mascota"/></label>
          <div className="form-pair"><label>Especie<select name="species" value={petForm.species} onChange={(event) => setPetForm({ ...petForm, species: event.target.value })}><option>Perro</option><option>Gato</option></select></label><label>Edad<input name="age" type="number" min="0" max="30" required value={petForm.age} onChange={(event) => setPetForm({ ...petForm, age: event.target.value })} placeholder="Años"/></label></div>
          <div className="form-pair"><label>Raza<input name="breed" required maxLength="120" value={petForm.breed} onChange={(event) => setPetForm({ ...petForm, breed: event.target.value })} placeholder="Raza o mestizo"/></label><label>Género<select name="gender" value={petForm.gender} onChange={(event) => setPetForm({ ...petForm, gender: event.target.value })}><option>Hembra</option><option>Macho</option></select></label></div>
          <div className="form-pair"><label>Tamaño<select name="size" value={petForm.size} onChange={(event) => setPetForm({ ...petForm, size: event.target.value })}><option>Pequeño</option><option>Mediano</option><option>Grande</option></select></label><label>Salud<input name="health" maxLength="120" value={petForm.health} onChange={(event) => setPetForm({ ...petForm, health: event.target.value })} placeholder="Vacunada, sana…"/></label></div>
          <label>Descripción<textarea name="description" rows="3" required maxLength="1200" value={petForm.description} onChange={(event) => setPetForm({ ...petForm, description: event.target.value })} placeholder="Personalidad, cuidados y lo que la hace única"/></label>
          <label>URL pública de imagen<input name="imageUrl" type="url" required value={petForm.imageUrl} onChange={(event) => setPetForm({ ...petForm, imageUrl: event.target.value })} placeholder="https://sitio.com/imagen.jpg"/><span className="form-hint">Usá una URL pública directa a una imagen HTTPS.</span></label>
          {petForm.imageUrl && <div className="pet-image-preview"><img src={petForm.imageUrl} alt="Vista previa de la mascota"/><span>Vista previa</span></div>}
          <button className="admin-primary" disabled={busy}>{busy ? "Guardando…" : editingPet ? "Guardar cambios" : "Publicar mascota"}</button>
        </form>
      </section>
      {pets.length ? <section className="pet-admin-grid">{pets.map((pet) => <article className={`pet-admin-card ${!pet.isAvailable ? "paused" : ""}`} key={pet.id}><div className="pet-admin-image"><img src={pet.imageUrl || pet.image} alt={pet.name}/><span>{pet.isAvailable ? "Disponible" : "Pausada"}</span></div><div className="pet-admin-copy"><span className="section-kicker">{pet.species} · {pet.size}</span><h3>{pet.name}</h3><p>{pet.breed} · {pet.age} {pet.age === 1 ? "año" : "años"} · {pet.gender}</p><p className="pet-admin-description">{pet.description}</p><div className="pet-admin-actions"><button onClick={() => editPet(pet)}>Editar ficha</button><button className={pet.isAvailable ? "archive" : "restore"} onClick={() => toggleAvailability(pet)}>{pet.isAvailable ? "Pausar" : "Reactivar"}</button></div></div></article>)}</section> : <div className="admin-empty">Todavía no hay mascotas. Completá la ficha para publicar la primera.</div>}
    </> : applications.length ? <section className="admin-table">{applications.map((item) => <article key={item.id} className="admin-card"><div><h3>{item.petName} <span className="admin-status">· {item.status}</span></h3><p><b>{item.name}</b> · {item.email} · {item.phone}</p>{item.message && <p>“{item.message}”</p>}<p>Recibida: {new Date(item.createdAt).toLocaleString("es-AR")}</p></div><div className="admin-actions"><button className="reject" disabled={item.status === "Rechazada"} onClick={() => updateStatus(item.id, "Rechazada")}>Rechazar</button><button className="approve" disabled={item.status === "Aprobada"} onClick={() => updateStatus(item.id, "Aprobada")}>Aprobar</button></div></article>)}</section> : <div className="admin-empty">Todavía no hay solicitudes de adopción.</div>}
  </main>;
}
