import "./globals.css";

export const metadata = {
  title: "Huellitas en casa | Adopción responsable",
  description: "Encontrá a tu nuevo mejor amigo. Conectamos hogares con mascotas que esperan una segunda oportunidad.",
};

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}
