import Link from "next/link";
import Image from "next/image";
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
      <div className="pog-burst relative overflow-hidden rounded-3xl border-2 border-foreground/10 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.svg"
              alt=""
              width={64}
              height={64}
              className="animate-spin-slow drop-shadow"
            />
            <div>
              <h1 className="text-3xl font-extrabold sm:text-4xl">
                <span className="pog-gradient-text">POG</span> Dashboard
              </h1>
              <p className="font-medium text-muted-foreground">
                Tvoja zbierka na jednom mieste — slammuj ďalej! 🎯
              </p>
            </div>
          </div>
          <Link
            href="/pogs?owned=missing"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Čo mi chýba
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <StatsPanel stats={stats} />

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold">👑 Najvzácnejšie kusy</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.rarest.map((pog) => (
            <Link key={pog._id} href={`/pogs/${pog._id}`}>
              <Card className="group h-full animate-pop-in border-2 pog-shadow-hover">
                <CardContent className="space-y-1 p-4">
                  <Crown className="h-6 w-6 text-amber-500 transition-transform group-hover:scale-125 group-hover:rotate-12" />
                  <p className="truncate font-bold">{pog.name}</p>
                  <p className="text-lg font-extrabold text-primary">
                    {formatPrice(pog.price)}
                  </p>
                  <span
                    className={cn(
                      "inline-block rounded-full border px-2 py-0.5 text-[11px] font-bold",
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
          <h2 className="text-2xl font-extrabold">📚 Kolekcie</h2>
          <Link
            href="/collections"
            className="text-sm font-bold text-primary hover:underline"
          >
            Zobraziť všetky →
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
