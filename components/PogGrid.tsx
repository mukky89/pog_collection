"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { PogCard } from "@/components/PogCard";
import { OwnedToggle } from "@/components/OwnedToggle";
import { Button } from "@/components/ui/button";
import {
  formatPrice,
  pogImageSrc,
  RARITY_LABELS,
  RARITY_STYLES,
  cn,
} from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import type { PogWithOwnership } from "@/types";

export function PogGrid({
  pogs,
  toggleView = true,
}: {
  pogs: PogWithOwnership[];
  toggleView?: boolean;
}) {
  const [view, setView] = React.useState<"grid" | "list">("grid");

  if (pogs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Žiadne POG predmety nezodpovedajú filtru.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pogs.length} {pogs.length === 1 ? "predmet" : "predmetov"}
        </p>
        {toggleView && (
          <div className="flex gap-1 rounded-md border p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("grid")}
              aria-label="Grid zobrazenie"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("list")}
              aria-label="List zobrazenie"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pogs.map((pog) => (
            <PogCard key={pog._id} pog={pog} />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {pogs.map((pog) => (
            <div
              key={pog._id}
              className={cn(
                "flex items-center gap-4 p-3",
                !pog.isOwned && "bg-muted/30"
              )}
            >
              <Link
                href={`/pogs/${pog._id}`}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-secondary",
                  pog.isOwned
                    ? "border-emerald-400/60"
                    : "border-dashed border-muted-foreground/30"
                )}
              >
                <Image
                  src={pogImageSrc(pog)}
                  alt={pog.name}
                  fill
                  sizes="56px"
                  className={cn(
                    "object-cover",
                    !pog.isOwned && "opacity-60 grayscale"
                  )}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/pogs/${pog._id}`}>
                  <p className="truncate font-medium hover:underline">
                    {pog.name}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground">
                  #{pog.number}
                  {!pog.isOwned && (
                    <span className="ml-2 rounded-full border border-muted-foreground/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      Nemám
                    </span>
                  )}
                </p>
              </div>
              <span
                className={cn(
                  "hidden rounded-full border px-2 py-0.5 text-xs font-medium sm:inline",
                  RARITY_STYLES[pog.rarity]
                )}
              >
                {RARITY_LABELS[pog.rarity]}
              </span>
              <span className="w-20 text-right font-semibold">
                {formatPrice(pog.price)}
              </span>
              <OwnedToggle
                pogId={pog._id}
                initialOwned={pog.isOwned}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
