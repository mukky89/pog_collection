import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPrice, collectionImageSrc, cn } from "@/lib/utils";
import { Trophy, CircleCheck } from "lucide-react";
import type { CollectionWithStats } from "@/types";

export function CollectionCard({
  collection,
}: {
  collection: CollectionWithStats;
}) {
  const complete = collection.completeness >= 100;
  // Kolekcie, ktoré vlastním (mám v nich aspoň 1 cap), zvýrazníme; prázdne
  // mierne stlmíme, nech sú „moje" kolekcie v popredí.
  const owned = collection.ownedCount > 0;
  return (
    <Link href={`/collections/${collection._id}`}>
      <Card
        className={cn(
          "group h-full animate-pop-in overflow-hidden border-2 pog-shadow-hover transition",
          owned
            ? "border-emerald-400/70 ring-2 ring-emerald-400/30"
            : "border-dashed border-muted-foreground/30 opacity-75 grayscale-[0.35] hover:opacity-100 hover:grayscale-0"
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <Image
            src={collectionImageSrc(collection)}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-extrabold text-primary shadow-sm backdrop-blur">
            {collection.completeness}%
          </span>
          {complete ? (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-amber-950 shadow-sm">
              <Trophy className="h-3 w-3" /> Komplet
            </span>
          ) : owned ? (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-extrabold text-white shadow-sm">
              <CircleCheck className="h-3 w-3" /> Zbieram · {collection.ownedCount}
            </span>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="font-extrabold text-white drop-shadow">
              {collection.name}
            </h3>
            <p className="text-xs font-medium text-white/85">
              {collection.manufacturer} · {collection.year}
            </p>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Kompletnosť
            </span>
            <span className="font-bold">
              {collection.ownedCount}/{collection.pogCount}
            </span>
          </div>
          <Progress value={collection.completeness} />
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="font-medium text-muted-foreground">Hodnota</span>
            <span className="font-bold">
              {formatPrice(collection.ownedValue)}
              <span className="text-muted-foreground">
                {" / "}
                {formatPrice(collection.totalValue)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
