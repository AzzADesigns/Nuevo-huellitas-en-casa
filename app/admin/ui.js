"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [applications, setApplications] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadApplications = useCallback(async () => {
    const response = await fetch("/api/adoptions", { cache: "no-store" });
    if (!response.ok) throw new Error("No pudimos cargar las solicitudes.");
    const data = await response.json();
    setApplications(data.adoptions);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" }).then(async (response) => {
      if (response.ok) {
        if (active) setAuthenticated(true);
        await loadApplications();
      }
    }).catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [loadApplications]);

  async function signIn(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No pudimos iniciar sesión.");
      setAuthenticated(true); setPassword(""); await loadApplications();
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  async function updateStatus(id, status) {
    setError("");
    const response = await fetch("/api/adoptions/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "No pudimos actualizar la solicitud."); return; }
    setApplications((current) => current.map((item) => item.id === id ? data.application : item));
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false); setApplications([]);
  }

  if (checking) return <main className="admin-login"><p>Preparando el panel…</p></main>;
  if (!authenticated) return <main className="admin-login"><form onSubmit={signIn}><Link href="/" className="catalog-back">← Volver al sitio</Link><span className="section-kicker">HUELLITAS EN CASA</span><h1>Panel de administración</h1><p>Ingresá con las credenciales configuradas para el refugio.</p>{error && <p className="admin-error" role="alert">{error}</p>}<label>Correo<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></label><button disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button></form></main>;

  return <main className="admin-page"><header className="admin-top"><Link href="/">← Huellitas en casa</Link><h1>Administración</h1><button onClick={signOut}>Cerrar sesión</button></header><section className="admin-title"><span className="section-kicker">SOLICITUDES DE ADOPCIÓN</span><h2>Intereses recibidos</h2><p>Revisá cada historia y actualizá su estado.</p></section>{error && <p className="admin-error" role="alert">{error}</p>}{applications.length ? <section className="admin-table">{applications.map((item) => <article key={item.id} className="admin-card"><div><h3>{item.petName} <span className="admin-status">· {item.status}</span></h3><p><b>{item.name}</b> · {item.email} · {item.phone}</p>{item.message && <p>“{item.message}”</p>}<p>Recibida: {new Date(item.createdAt).toLocaleString("es-AR")}</p></div><div className="admin-actions"><button className="reject" disabled={item.status === "Rechazada"} onClick={() => updateStatus(item.id, "Rechazada")}>Rechazar</button><button className="approve" disabled={item.status === "Aprobada"} onClick={() => updateStatus(item.id, "Aprobada")}>Aprobar</button></div></article>)}</section> : <div className="admin-empty">Todavía no hay solicitudes de adopción.</div>}</main>;
}
