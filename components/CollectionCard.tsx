import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/lib/utils";
import type { CollectionWithStats } from "@/types";

export function CollectionCard({
  collection,
}: {
  collection: CollectionWithStats;
}) {
  return (
    <Link href={`/collections/${collection._id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <Image
            src={collection.coverImage || "/placeholder-pog.svg"}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="font-semibold text-white">{collection.name}</h3>
            <p className="text-xs text-white/80">
              {collection.manufacturer} · {collection.year}
            </p>
          </div>
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Kompletnosť</span>
            <span className="font-semibold">
              {collection.ownedCount}/{collection.pogCount} ·{" "}
              {collection.completeness}%
            </span>
          </div>
          <Progress value={collection.completeness} />
          <div className="flex items-center justify-between pt-1 text-sm">
            <span className="text-muted-foreground">Hodnota</span>
            <span className="font-semibold">
              {formatPrice(collection.ownedValue)}
              <span className="text-muted-foreground">
                {" "}
                / {formatPrice(collection.totalValue)}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
