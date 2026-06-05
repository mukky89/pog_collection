import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwnedToggle } from "@/components/OwnedToggle";
import { formatPrice, RARITY_LABELS, RARITY_STYLES, cn } from "@/lib/utils";
import type { PogWithOwnership } from "@/types";

export function PogCard({ pog }: { pog: PogWithOwnership }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/pogs/${pog._id}`}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        <Image
          src={pog.imageUrl || "/placeholder-pog.svg"}
          alt={pog.name}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          className="object-cover transition-transform group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            RARITY_STYLES[pog.rarity]
          )}
        >
          {RARITY_LABELS[pog.rarity]}
        </span>
        {pog.isOwned && (
          <Badge variant="success" className="absolute right-2 top-2">
            Vlastním
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/pogs/${pog._id}`}>
              <h3 className="truncate text-sm font-semibold hover:underline">
                {pog.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground">#{pog.number}</p>
          </div>
          <span className="shrink-0 text-sm font-semibold">
            {formatPrice(pog.price)}
          </span>
        </div>
        <div className="mt-auto pt-1">
          <OwnedToggle
            pogId={pog._id}
            initialOwned={pog.isOwned}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
