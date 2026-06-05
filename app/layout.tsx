import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { VERSION_LABEL } from "@/lib/version";

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
          <div className="container flex flex-col items-center gap-1 text-center text-sm font-medium text-muted-foreground">
            <div>
              🔴{" "}
              <span className="pog-gradient-text font-extrabold">
                POG Collector
              </span>{" "}
              — slammuj, zbieraj, vyhrávaj!
            </div>
            <code className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {VERSION_LABEL}
            </code>
          </div>
        </footer>
      </body>
    </html>
  );
}
