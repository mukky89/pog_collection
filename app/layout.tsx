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
        <footer className="mt-8 border-t-2 border-foreground/10 py-6">
          <div className="container text-center text-sm font-medium text-muted-foreground">
            🔴 <span className="pog-gradient-text font-extrabold">POG Collector</span>{" "}
            — slammuj, zbieraj, vyhrávaj!
          </div>
        </footer>
      </body>
    </html>
  );
}
