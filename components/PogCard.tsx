import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwnedToggle } from "@/components/OwnedToggle";
import {
  formatPrice,
  pogImageSrc,
  pogSkinUrl,
  RARITY_LABELS,
  RARITY_STYLES,
  RARITY_RING,
  cn,
} from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { PogWithOwnership } from "@/types";

export function PogCard({ pog }: { pog: PogWithOwnership }) {
  const owned = pog.isOwned;
  return (
    <Card
      className={cn(
        "group flex animate-pop-in flex-col overflow-hidden border-2 pog-shadow-hover",
        owned
          ? "border-emerald-400/60"
          : "border-dashed border-muted-foreground/30 bg-muted/30"
      )}
    >
      <Link
        href={`/pogs/${pog._id}`}
        className="pog-flip relative block aspect-square overflow-hidden bg-secondary"
      >
        <div
          className={cn(
            "pog-flip-inner absolute inset-2 transition duration-300",
            // Nevlastnené capy stlmíme do šedej; na hover sa farba obnoví.
            !owned &&
              "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"
          )}
        >
          <div
            className={cn(
              "pog-face overflow-hidden rounded-full ring-4 ring-offset-2 ring-offset-card",
              RARITY_RING[pog.rarity]
            )}
          >
            <Image
              src={pogImageSrc(pog)}
              alt={pog.name}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover"
            />
          </div>
          <div
            className={cn(
              "pog-face pog-face-back overflow-hidden rounded-full ring-4 ring-offset-2 ring-offset-card",
              RARITY_RING[pog.rarity]
            )}
          >
            <Image
              src={
                pog.imageBackUrl?.trim() ||
                pogSkinUrl(`${pog.name}-${pog.number}`, pog.rarity, "back")
              }
              alt={`${pog.name} — zadná strana`}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover"
            />
          </div>
        </div>
        <span
          className={cn(
            "absolute left-2 top-2 z-10 rounded-full border px-2 py-0.5 text-[11px] font-bold shadow-sm",
            RARITY_STYLES[pog.rarity]
          )}
        >
          {RARITY_LABELS[pog.rarity]}
        </span>
        {owned ? (
          <Badge
            variant="success"
            className="absolute right-2 top-2 z-10 gap-1 shadow-sm"
          >
            <Check className="h-3 w-3" /> Mám
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 z-10 gap-1 border border-muted-foreground/30 text-muted-foreground shadow-sm"
          >
            <X className="h-3 w-3" /> Nemám
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/pogs/${pog._id}`}>
              <h3 className="truncate text-sm font-bold hover:text-primary">
                {pog.name}
              </h3>
            </Link>
            <p className="text-xs font-medium text-muted-foreground">
              #{pog.number}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-sm font-extrabold text-accent-foreground">
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
