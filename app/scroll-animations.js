"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const EASE = "power3.out";

/** Marca un elemento como animado para no repetirlo. Devuelve true si es nuevo. */
function claim(element) {
  if (!element || element.dataset.anim) return false;
  element.dataset.anim = "1";
  return true;
}

function onScroll(trigger, start = "top 80%") {
  return gsap.timeline({ defaults: { ease: EASE }, scrollTrigger: { trigger, start, once: true } });
}

function heroIntro() {
  const hero = document.querySelector(".hero");
  if (!claim(hero)) return;
  const q = gsap.utils.selector(hero);
  gsap.timeline({ defaults: { ease: EASE } })
    .fromTo(q(".hero-photo"), { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
    .fromTo(".main-nav", { autoAlpha: 0, y: -80 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1)
    .fromTo(q(".hero-kicker"), { autoAlpha: 0, y: 18, letterSpacing: "7px" }, { autoAlpha: 1, y: 0, letterSpacing: "2px", duration: 1 }, 0.3)
    .fromTo(q("h1"), { autoAlpha: 0, y: 60, skewY: 3 }, { autoAlpha: 1, y: 0, skewY: 0, duration: 1.1 }, 0.4)
    .fromTo(q("h1 em"), { scale: 0.6, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.4)" }, 0.95)
    .fromTo(q(".hero-copy p"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.7)
    .fromTo(q(".hero-actions > *"), { autoAlpha: 0, y: 24, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: "back.out(1.8)", clearProps: "transform" }, 0.9)
    .fromTo(q(".hero-scroll"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.4)
    .fromTo(q(".hero-caption"), { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 1 }, 1.1);

  // Parallax al salir del hero: la foto va más lenta y el texto se despega hacia arriba.
  const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };
  gsap.to(q(".hero-media"), { yPercent: 28, ease: "none", scrollTrigger: scrub });
  gsap.to(q(".hero-copy"), { y: -90, opacity: 0.15, ease: "none", scrollTrigger: scrub });
  gsap.to(q(".hero-caption"), { y: -40, ease: "none", scrollTrigger: scrub });
  gsap.to(q(".hero-scroll"), { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "15% top", scrub: true } });
}

function about() {
  const band = document.querySelector(".about-band");
  if (!claim(band)) return;
  const q = gsap.utils.selector(band);
  onScroll(band, "top 78%")
    .fromTo(q(".about-main-photo"), { autoAlpha: 0, x: 90, y: 30, rotation: 12, scale: 0.88 }, { autoAlpha: 1, x: 0, y: 0, rotation: -4, scale: 1, duration: 1.2 })
    .fromTo(q(".about-small-photo"), { autoAlpha: 0, x: -80, rotation: -14, scale: 0.8 }, { autoAlpha: 1, x: 0, rotation: 5, scale: 1, duration: 1.1, ease: "back.out(1.5)" }, 0.25)
    .fromTo(q(".about-paw"), { autoAlpha: 0, scale: 0, rotation: -50 }, { autoAlpha: 0.34, scale: 1, rotation: 18, duration: 0.8, ease: "back.out(3)" }, 0.7)
    .fromTo(q(".about-copy > *"), { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.11 }, 0.15);

  const scrub = { trigger: band, start: "top bottom", end: "bottom top", scrub: 0.8 };
  gsap.fromTo(q(".about-art"), { y: 40 }, { y: -40, ease: "none", scrollTrigger: scrub });
}

function headings() {
  document.querySelectorAll(".section-heading").forEach((heading) => {
    if (!claim(heading)) return;
    const [kicker, ...rest] = heading.children;
    onScroll(heading, "top 85%")
      .fromTo(kicker, { autoAlpha: 0, y: 14, letterSpacing: "8px" }, { autoAlpha: 1, y: 0, letterSpacing: "2px", duration: 0.9 })
      .fromTo(rest, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.12);
  });
}

function petRows() {
  document.querySelectorAll(".pet-row").forEach((row) => {
    if (!claim(row)) return;
    const q = gsap.utils.selector(row);
    const dir = row.classList.contains("reverse") ? 1 : -1; // lado del que entra la foto
    onScroll(row, "top 82%")
      .fromTo(q(".pet-portrait"), { autoAlpha: 0, x: 120 * dir, rotation: 35 * dir, scale: 0.55 }, { autoAlpha: 1, x: 0, rotation: 0, scale: 1, duration: 1.2, ease: "back.out(1.3)", clearProps: "transform" })
      .fromTo(q(".portrait-heart"), { scale: 0 }, { scale: 1, duration: 0.55, ease: "back.out(3.5)", clearProps: "transform" }, 0.75)
      .fromTo(q(".pet-story > *"), { autoAlpha: 0, x: -50 * dir }, { autoAlpha: 1, x: 0, duration: 0.85, stagger: 0.09 }, 0.2)
      .fromTo(q(".pet-trail"), { autoAlpha: 0, scale: 0.3, rotation: -60 * dir }, { autoAlpha: 0.12, scale: 1, rotation: dir > 0 ? -20 : 22, duration: 1.1 }, 0.5);

    // La foto se desplaza suavemente dentro del círculo mientras scrolleás.
    gsap.fromTo(q(".pet-portrait-media img"), { yPercent: -7, scale: 1.18 }, { yPercent: 7, scale: 1.18, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  });
}

function morePets() {
  const box = document.querySelector(".more-pets");
  if (!claim(box)) return;
  onScroll(box, "top 90%")
    .fromTo(box, { autoAlpha: 0, y: 50, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, clearProps: "transform" })
    .fromTo(box.querySelector("a"), { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(2)", clearProps: "transform" }, 0.35);
}

function closingNote() {
  const note = document.querySelector(".closing-note");
  if (!claim(note)) return;
  const q = gsap.utils.selector(note);
  onScroll(note, "top 75%")
    .fromTo(q(".closing-dog"), { y: 260, rotation: 6 }, { y: 0, rotation: 0, duration: 1.3, ease: "power4.out" })
    .fromTo(q(".section-kicker"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.2)
    .fromTo(q("h2"), { autoAlpha: 0, y: 50, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, 0.3)
    .fromTo(q(".closing-button"), { autoAlpha: 0, y: 30, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(2)", clearProps: "transform" }, 0.6);
}

function footer() {
  document.querySelectorAll(".footer-top").forEach((top) => {
    if (!claim(top)) return;
    onScroll(top, "top 95%").fromTo(top.children, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 });
  });
}

function catalog() {
  const head = document.querySelector(".catalog-head");
  if (claim(head)) {
    gsap.timeline({ defaults: { ease: EASE } })
      .fromTo(head.children, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09 });
  }
  const tools = document.querySelector(".catalog-tools");
  if (claim(tools)) gsap.fromTo(tools, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.35, ease: EASE });

  const cards = gsap.utils.toArray(".catalog-card").filter(claim);
  if (!cards.length) return;
  ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 70, rotationX: -12, scale: 0.94, transformPerspective: 900 },
      { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 0.9, stagger: 0.09, ease: EASE, clearProps: "transform" }),
  });
}

const SECTIONS = [heroIntro, about, headings, petRows, morePets, closingNote, footer, catalog];

export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("anim")) return undefined; // sin animaciones (prefers-reduced-motion)
    window.__animReady = true;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {});
    const scan = () => ctx.add(() => {
      SECTIONS.forEach((section) => section());
      ScrollTrigger.refresh();
    });
    scan();

    // Contenido que aparece después (filtros del catálogo, imágenes que cambian el alto, etc.).
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
      ctx.revert();
      document.querySelectorAll("[data-anim]").forEach((element) => delete element.dataset.anim);
    };
  }, [pathname]);

  return null;
}
