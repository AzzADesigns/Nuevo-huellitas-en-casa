"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PetImage from "./pet-image";

export default function AdoptionApp({ initialPets = [] }) {
 const pets=initialPets;
 const [activePet,setActivePet]=useState(null),[formMode,setFormMode]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 async function handleSubmit(event){
  event.preventDefault(); const form=event.currentTarget,values=Object.fromEntries(new FormData(form)); setBusy(true);
  try{
   const response=await fetch("/api/adoptions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,petId:activePet.id})});
   const data=await response.json(); if(!response.ok)throw new Error(data.error||"No pudimos enviar tus datos.");
   setNotice("¡Gracias! Recibimos tu interés por "+activePet.name+".");setFormMode("");setActivePet(null);form.reset();
  }catch(error){setNotice(error.message)}finally{setBusy(false)}
 }
 return <>
 <header className="hero" id="inicio">
  <div className="hero-media"><Image className="hero-photo" src="/images/HeaderIMG.webp" alt="Una mascota esperando un hogar" fill priority sizes="100vw" quality={70}/></div><div className="hero-shade"/>
  <div className="nav-holder"><nav className="main-nav"><a className="logo-link" href="#inicio"><Image src="/images/logo.webp" alt="Huellitas en casa" width={76} height={58}/></a><a href="#mascotas">Huellitas</a><a href="#nosotros">Sobre nosotros</a><Link className="nav-action" href="/huellitas">Ver mascotas <span>↗</span></Link></nav></div>
  <div className="hero-copy"><span className="hero-kicker">UNA FAMILIA. UNA HUELLA. UNA HISTORIA.</span><h1>Cada huellita merece{" "}<br/>un lugar al que llamar <em>hogar.</em></h1><p>Cada año, miles de mascotas buscan un lugar al que llamar hogar. Al elegir adoptar, no solo estás salvando una vida: estás creando un vínculo de confianza, alegría y, sobre todo, <strong>amor.</strong></p><div className="hero-actions"><a className="hero-button" href="#mascotas">Conocé a quienes te esperan <span>↓</span></a><Link className="hero-ghost" href="/huellitas">Ver todas las mascotas</Link></div></div>
  <div className="hero-caption">ADOPTAR CAMBIA DOS VIDAS <span>—</span> LA SUYA Y LA TUYA</div><a className="hero-scroll" href="#nosotros" aria-label="Bajar a la siguiente sección"><span/></a>
 </header>
 <main>
  <section className="about-band" id="nosotros"><div className="about-art"><Image className="about-main-photo" src="/images/chica-y-gato.webp" alt="Una familia compartiendo con su gato" width={460} height={570} sizes="(max-width: 600px) 220px, 320px"/><Image className="about-small-photo" src="/images/PerroPrimerPlano.webp" alt="Un perro listo para conocer a su familia" width={300} height={330} sizes="(max-width: 600px) 150px, 200px"/><Image className="about-paw" src="/images/Huella.svg" alt="" width={56} height={56}/></div><div className="about-copy"><span className="section-kicker">QUIÉNES SOMOS</span><h2>Huellitas <span>en casa</span></h2><p>Somos una familia dedicada a crear conexiones únicas entre personas y mascotas. Queremos brindarle una nueva oportunidad a vidas que están en búsqueda de un hogar.</p><p>Creemos que cada una merece un lugar donde ser feliz, una adopción a la vez.</p><a href="#mascotas" className="about-link">Encontrá tu compañero <span>→</span></a></div></section>
  <section className="pets-section" id="mascotas"><div className="section-heading"><span className="section-kicker">AMIGOS QUE BUSCAN FAMILIA</span><h2>Encuentra tu <span>huellita</span></h2><p>Tenemos amigos que buscan cambiar su vida y la tuya.</p></div>
   {pets.length ? <div className="pet-list">{pets.map((pet,index)=><article className={"pet-row "+(index%2?"reverse":"")} key={pet.id} onClick={()=>setActivePet(pet)}>
    <div className="pet-portrait"><span className="pet-portrait-media"><PetImage src={pet.imageUrl||pet.image} alt={pet.name+", "+pet.species+" en adopción"} sizes="(max-width: 600px) 128px, 220px"/></span><span className="portrait-heart">♥</span></div>
    <div className="pet-story"><span className="pet-index">{String(index+1).padStart(2,"0")} <i/> UNA NUEVA HISTORIA</span><h3>¡¡Hola!!, soy <em>{pet.name}</em></h3><p className="pet-facts"><span>{pet.age} {pet.age===1?"año":"años"}</span><b>·</b><span>{pet.breed}</span><b>·</b><span>{pet.gender}</span></p><p className="pet-description">{pet.description}</p><button className="pet-more" onClick={(event)=>{event.stopPropagation();setActivePet(pet)}}>Conocé mi historia <span>↗</span></button></div><Image className="pet-trail" src="/images/Huella.svg" alt="" width={100} height={100}/>
   </article>)}</div> : <div className="catalog-empty"><h2>Pronto habrá nuevas historias.</h2><p>Estamos preparando las fichas de las mascotas que buscan familia.</p></div>}
   <div className="more-pets"><div><span>¿No encontraste a tu compañero todavía?</span><p>Hay muchas más historias esperando conocerte.</p></div><Link href="/huellitas">Conocé a todos <span>→</span></Link></div>
  </section>
  <section className="closing-note"><Image className="closing-dog" src="/images/perroSinFondo.webp" alt="" width={420} height={525} sizes="(max-width: 600px) 140px, 220px"/><span className="section-kicker">UNA ADOPCIÓN A LA VEZ</span><h2>El amor encuentra<br/>su camino a <em>casa.</em></h2><a href="#mascotas" className="closing-button">Abrí tu corazón <span>→</span></a></section>
 </main>
 <footer className="site-footer"><div className="footer-top"><a className="footer-logo" href="#inicio"><Image src="/images/logo.webp" alt="Huellitas en casa" width={76} height={58}/></a><p>Una familia dedicada a crear conexiones únicas<br/>entre personas y mascotas.</p><Link className="footer-top-link" href="/admin">Acceso de administración</Link><a className="footer-top-link" href="#inicio">Volver arriba ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Huellitas en casa</span><span>Hecho con <b>♥</b> para quienes esperan un hogar</span></div></footer>
 {notice&&<div className="notice" role="status"><span>✓</span> {notice}<button onClick={()=>setNotice("")} aria-label="Cerrar">×</button></div>}
 {activePet&&<div className="modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget){setActivePet(null);setFormMode("")}}}><section className={"pet-modal "+(formMode?"form-modal":"")} role="dialog" aria-modal="true" aria-label={formMode?"Enviar solicitud de adopción":"Información de "+activePet.name}><button className="modal-close" onClick={()=>{setActivePet(null);setFormMode("")}} aria-label="Cerrar">×</button>
  {!formMode&&<><div className="modal-photo"><PetImage src={activePet.imageUrl||activePet.image} alt={activePet.name} sizes="(max-width: 600px) 100vw, 380px" priority/></div><div className="modal-info"><span className="section-kicker">UNA NUEVA HISTORIA</span><h2>Hola, soy <em>{activePet.name}</em></h2><p className="modal-breed">{activePet.breed} · {activePet.species}</p><p>{activePet.description}</p><div className="modal-facts"><span>Edad <b>{activePet.age} {activePet.age===1?"año":"años"}</b></span><span>Género <b>{activePet.gender}</b></span><span>Tamaño <b>{activePet.size}</b></span><span>Salud <b>{activePet.health}</b></span></div><button className="submit-button" onClick={()=>setFormMode("adopt")}>Quiero conocerle <span>→</span></button></div></>}
  {formMode&&<div className="modal-info form-info"><span className="section-kicker">EL PRIMER PASO DE UNA GRAN HISTORIA</span><h2>Conocé a {activePet.name}</h2><p>Dejanos tus datos y te contactamos para acompañarte.</p><form onSubmit={handleSubmit}><label>Tu nombre<input name="name" required autoComplete="name" placeholder="Nombre y apellido"/></label><label>Correo electrónico<input name="email" type="email" required autoComplete="email" placeholder="hola@ejemplo.com"/></label><label>Teléfono<input name="phone" type="tel" required autoComplete="tel" placeholder="+54 9 11 1234 5678"/></label><label>Un mensaje <span>(opcional)</span><textarea name="message" rows="2" placeholder="Contanos algo sobre vos"/></label><button className="submit-button" disabled={busy}>{busy?"Enviando…":"Enviar mi interés"} <span>→</span></button></form></div>}
 </section></div>}
 </>;
}
