import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-muted-foreground">Táto stránka neexistuje.</p>
      <Link href="/" className={buttonVariants()}>
        Späť na Dashboard
      </Link>
    </div>
  );
}
