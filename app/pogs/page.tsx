import { FilterBar } from "@/components/FilterBar";
import { PogGrid } from "@/components/PogGrid";
import { DbErrorState } from "@/components/EmptyState";
import { getPogs, getAllCollectionsPlain, type PogQueryOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const opts: PogQueryOptions = {
    search: searchParams.search,
    collectionId: searchParams.collectionId,
    rarity: searchParams.rarity,
    owned: searchParams.owned as "owned" | "missing" | undefined,
    sort: searchParams.sort as PogQueryOptions["sort"],
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  };

  let pogs;
  let collections;
  try {
    [pogs, collections] = await Promise.all([
      getPogs(opts),
      getAllCollectionsPlain(),
    ]);
  } catch (e: any) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Všetky POG</h1>
        <DbErrorState message={e.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Všetky POG</h1>
        <p className="text-muted-foreground">
          Vyhľadávanie, filtrovanie a triedenie celého katalógu
        </p>
      </div>
      <FilterBar
        collections={collections.map((c) => ({ _id: c._id, name: c.name }))}
      />
      <PogGrid pogs={pogs} />
    </div>
  );
}
