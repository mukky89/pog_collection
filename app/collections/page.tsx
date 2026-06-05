import { CollectionsView } from "@/components/CollectionsView";
import { DbErrorState, EmptyState } from "@/components/EmptyState";
import { getCollectionsWithStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  let collections;
  try {
    collections = await getCollectionsWithStats();
  } catch (e: any) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Kolekcie</h1>
        <DbErrorState message={e.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kolekcie</h1>
        <p className="text-muted-foreground">
          Všetky série POG a ich kompletnosť
        </p>
      </div>
      {collections.length === 0 ? (
        <EmptyState
          title="Žiadne kolekcie"
          description="Pridaj prvú kolekciu v admin sekcii."
          actionLabel="Prejsť do Adminu"
          actionHref="/admin"
        />
      ) : (
        <CollectionsView collections={collections} />
      )}
    </div>
  );
}
