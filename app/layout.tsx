import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "POG Collector",
  description: "Evidencia a správa zbierky POG the Game predmetov",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body>
        <Navbar />
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6">
          <div className="container text-center text-sm text-muted-foreground">
            POG Collector — evidencia zbierky POG the Game
          </div>
        </footer>
      </body>
    </html>
  );
}
