"use client";

import Image from "next/image";
import { useState } from "react";

// Imágenes que Next puede optimizar (redimensiona y sirve WebP): locales y Supabase Storage.
function canOptimize(src) {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const { protocol, hostname, pathname } = new URL(src);
    return protocol === "https:" && hostname.endsWith(".supabase.co") && pathname.startsWith("/storage/v1/object/public/");
  } catch { return false; }
}

/** Foto de mascota: responsive, WebP, con fundido suave al cargar. El contenedor debe tener position:relative. */
export default function PetImage({ src, alt, sizes = "(max-width: 600px) 50vw, 400px", className = "", priority = false, quality = 75 }) {
  const [loaded, setLoaded] = useState(false);
  if (!src) return null;
  return <Image
    src={src} alt={alt} fill sizes={sizes} priority={priority} quality={quality}
    unoptimized={!canOptimize(src)}
    className={`pet-image ${loaded ? "is-loaded" : ""} ${className}`.trim()}
    onLoad={() => setLoaded(true)}
  />;
}
