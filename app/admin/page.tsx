import { AdminPanel } from "@/components/admin/AdminPanel";
import { DbErrorState } from "@/components/EmptyState";
import { getAllCollectionsPlain, getPogs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let collections;
  let pogs;
  try {
    [collections, pogs] = await Promise.all([
      getAllCollectionsPlain(),
      getPogs(),
    ]);
  } catch (e: any) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin správa</h1>
        <DbErrorState message={e.message} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          ⚙️ <span className="pog-gradient-text">Admin správa</span>
        </h1>
        <p className="font-medium text-muted-foreground">
          Pridávanie a editovanie kolekcií, POG predmetov a hromadný import
        </p>
      </div>
      <AdminPanel collections={collections} pogs={pogs} />
    </div>
  );
}
