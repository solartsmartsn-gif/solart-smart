import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Solart Smart | Solutions solaires au Sénégal",
  description:
    "Solart Smart propose des kits solaires maison et des solutions de pompage solaire au Sénégal.",
  keywords: [
    "Solart Smart",
    "solaire Sénégal",
    "kit solaire maison",
    "pompage solaire",
    "panneaux solaires",
    "énergie solaire",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}