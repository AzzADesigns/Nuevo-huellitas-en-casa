import "./globals.css";
import ScrollAnimations from "./scroll-animations";

export const metadata = {
  title: "Huellitas en casa | Adopción responsable",
  description: "Encontrá a tu nuevo mejor amigo. Conectamos hogares con mascotas que esperan una segunda oportunidad.",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

// Activa las animaciones antes de pintar (evita parpadeos). Si el JS no llega, a los 3,5 s se muestra todo igual.
const animBoot = `(function(){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var d=document.documentElement;d.classList.add('anim');setTimeout(function(){if(!window.__animReady)d.classList.remove('anim')},3500)}catch(e){}})();`;

export default function RootLayout({ children }) {
  return <html lang="es" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: animBoot }} /></head>
    <body><ScrollAnimations />{children}</body>
  </html>;
}
