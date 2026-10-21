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

export default function RootLayout({ children }) {
  return <html lang="es"><body><ScrollAnimations />{children}</body></html>;
}
