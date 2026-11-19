import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Montserrat servie depuis le dépôt (police variable, latin, 400 à 900) :
// next/font/google échouait au build Vercel (« next/font/google queries have
// exactly one entry », erreur Turbopack intermittente au téléchargement).
const montserrat = localFont({
  src: "./fonts/montserrat-latin.woff2",
  weight: "400 900",
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EP Coaching",
  description: "EP Coaching",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={montserrat.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
