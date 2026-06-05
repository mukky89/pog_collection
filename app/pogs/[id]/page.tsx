import { notFound } from "next/navigation";
import Link from "next/link";
import { PogImageViewer } from "@/components/PogImageViewer";
import { OwnershipEditor } from "@/components/OwnershipEditor";
import { PogCard } from "@/components/PogCard";
import { Card, CardContent } from "@/components/ui/card";
import { DbErrorState } from "@/components/EmptyState";
import { getPogById, getSimilarPogs } from "@/lib/queries";
import {
  formatPrice,
  RARITY_LABELS,
  RARITY_STYLES,
  cn,
} from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Collection } from "@/types";

export const dynamic = "force-dynamic";

export default async function PogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let pog;
  let similar;
  try {
    pog = await getPogById(params.id);
    if (!pog) notFound();
    similar = await getSimilarPogs(pog);
  } catch (e: any) {
    if (e?.digest === "NEXT_NOT_FOUND") throw e;
    return <DbErrorState message={e.message} />;
  }

  const collection =
    typeof pog.collectionId === "object"
      ? (pog.collectionId as Collection)
      : null;

  return (
    <div className="space-y-8">
      <Link
        href="/pogs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na zoznam
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <PogImageViewer
          front={pog.imageUrl}
          back={pog.imageBackUrl}
          alt={pog.name}
          rarity={pog.rarity}
        />

        <div className="space-y-5">
          <div className="space-y-2">
            <span
              className={cn(
                "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                RARITY_STYLES[pog.rarity]
              )}
            >
              {RARITY_LABELS[pog.rarity]}
            </span>
            <h1 className="text-3xl font-bold">{pog.name}</h1>
            {collection && (
              <Link
                href={`/collections/${collection._id}`}
                className="text-sm text-primary hover:underline"
              >
                {collection.name}
              </Link>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(pog.price)}
            </span>
            <span className="text-sm text-muted-foreground">trhová cena</span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-secondary p-3">
              <dt className="text-xs text-muted-foreground">Číslo v sérii</dt>
              <dd className="font-semibold">#{pog.number}</dd>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <dt className="text-xs text-muted-foreground">Vzácnosť</dt>
              <dd className="font-semibold">{RARITY_LABELS[pog.rarity]}</dd>
            </div>
          </dl>

          {pog.description && (
            <p className="text-sm text-muted-foreground">{pog.description}</p>
          )}

          {pog.tags && pog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pog.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-5">
              <OwnershipEditor
                pogId={pog._id}
                isOwned={pog.isOwned}
                ownership={pog.ownership ?? null}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Podobné predmety</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {similar.map((p) => (
              <PogCard key={p._id} pog={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
