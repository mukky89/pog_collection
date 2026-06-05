import Link from "next/link";
import { StatsPanel } from "@/components/StatsPanel";
import { CollectionCard } from "@/components/CollectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { DbErrorState, EmptyState } from "@/components/EmptyState";
import { getDashboardStats, getCollectionsWithStats } from "@/lib/queries";
import {
  formatPrice,
  RARITY_LABELS,
  RARITY_STYLES,
  cn,
} from "@/lib/utils";
import { ArrowRight, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats;
  let collections;
  try {
    [stats, collections] = await Promise.all([
      getDashboardStats(),
      getCollectionsWithStats(),
    ]);
  } catch (e: any) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DbErrorState message={e.message} />
      </div>
    );
  }

  if (stats.totalPogs === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <EmptyState
          title="Zatiaľ žiadne POG predmety"
          description="Začni pridaním kolekcií a POG predmetov v admin sekcii alebo hromadným importom cez CSV."
          actionLabel="Prejsť do Adminu"
          actionHref="/admin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/pogs?owned=missing"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Chýbajúce predmety
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <StatsPanel stats={stats} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Najvzácnejšie kusy</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.rarest.map((pog) => (
            <Link key={pog._id} href={`/pogs/${pog._id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="space-y-1 p-4">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <p className="truncate font-medium">{pog.name}</p>
                  <p className="text-lg font-bold">{formatPrice(pog.price)}</p>
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      RARITY_STYLES[pog.rarity]
                    )}
                  >
                    {RARITY_LABELS[pog.rarity]}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Kolekcie</h2>
          <Link
            href="/collections"
            className="text-sm text-primary hover:underline"
          >
            Zobraziť všetky
          </Link>
        </div>
        {collections.length === 0 ? (
          <EmptyState title="Žiadne kolekcie" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.slice(0, 6).map((c) => (
              <CollectionCard key={c._id} collection={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
