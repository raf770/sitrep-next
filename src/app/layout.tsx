import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SITREP — L'info au service de la décision",
  description: "Think tank géopolitique MENA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
