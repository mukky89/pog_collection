import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { OwnershipTabs } from "@/components/OwnershipTabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { DbErrorState } from "@/components/EmptyState";
import { getCollectionById, getPogsForCollection } from "@/lib/queries";
import { formatPrice, collectionImageSrc } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let collection;
  let pogs;
  try {
    collection = await getCollectionById(params.id);
    if (!collection) notFound();
    pogs = await getPogsForCollection(collection._id);
  } catch (e: any) {
    if (e?.digest === "NEXT_NOT_FOUND") throw e;
    return <DbErrorState message={e.message} />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na kolekcie
      </Link>

      <Card className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[300px_1fr]">
          <div className="relative aspect-video md:aspect-auto md:h-full bg-secondary">
            <Image
              src={collectionImageSrc(collection)}
              alt={collection.name}
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>
          <CardContent className="space-y-4 p-6">
            <div>
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              <p className="text-muted-foreground">
                {collection.manufacturer} · {collection.year}
              </p>
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kompletnosť</span>
                <span className="font-semibold">
                  {collection.ownedCount}/{collection.pogCount} ·{" "}
                  {collection.completeness}%
                </span>
              </div>
              <Progress value={collection.completeness} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">
                  Hodnota vlastnených
                </p>
                <p className="font-semibold">
                  {formatPrice(collection.ownedValue)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">
                  Hodnota celej série
                </p>
                <p className="font-semibold">
                  {formatPrice(collection.totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <OwnershipTabs pogs={pogs} />
    </div>
  );
}
