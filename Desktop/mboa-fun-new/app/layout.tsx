import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mboa Fun - Jeux Camerounais Premium",
  description: "Découvrez Mboa Empire, Ludo 237, Check Gems et plus. La plateforme de jeux camerounais avec Mboa Gems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mboa-bg text-mboa-text">{children}</body>
    </html>
  );
}
