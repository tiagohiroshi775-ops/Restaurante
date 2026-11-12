import "animate.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { restaurante } from "@/lib/menu";

export const metadata = {
  title: { default: `${restaurante.nome} — Cardápio`, template: `%s · ${restaurante.nome}` },
  description: "Cardápio digital com visualização dos pratos em 3D e realidade aumentada.",
  robots: { index: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14110F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
