"use client";

import Image from "next/image";

/** Keeps image loading stable; scroll reveals are handled by ScrollAnimations. */
export default function AnimatedImage({ native = false, ...props }) {
  const ImageComponent = native ? "img" : Image;
  return <ImageComponent {...props} />;
}
