"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

const REVEAL_SELECTOR = [
  ".about-art",
  ".about-copy",
  ".section-heading",
  ".pet-row",
  ".more-pets",
  ".closing-note",
  ".catalog-head",
  ".catalog-tools",
  ".catalog-card",
  ".catalog-empty",
  ".site-footer",
  ".admin-title",
  ".admin-summary",
  ".admin-tabs",
  ".pet-editor",
  ".pet-admin-card",
  ".admin-card",
].join(",");

export default function ScrollAnimations() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return undefined;

    const activeAnimations = new Set();
    let firstScan = true;
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        intersectionObserver.unobserve(entry.target);
        let animation;
        animation = gsap.fromTo(
          entry.target,
          { autoAlpha: 0.72, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            onStart: () => gsap.set(entry.target, { willChange: "opacity, transform" }),
            onComplete: () => {
              gsap.set(entry.target, { clearProps: "willChange,opacity,visibility,transform" });
              activeAnimations.delete(animation);
            },
          },
        );
        activeAnimations.add(animation);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
        if (element.dataset.revealReady) return;

        const bounds = element.getBoundingClientRect();
        const currentlyVisible = bounds.top < window.innerHeight && bounds.bottom > 0;
        if (firstScan && currentlyVisible) {
          element.dataset.revealReady = "visible";
          return;
        }

        element.dataset.revealReady = "true";
        intersectionObserver.observe(element);
      });
      firstScan = false;
    };

    scan();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length)) scan();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      intersectionObserver.disconnect();
      activeAnimations.forEach((animation) => {
        animation.kill();
      });
      activeAnimations.clear();
    };
  }, []);

  return null;
}
