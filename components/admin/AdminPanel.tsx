"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CollectionAdmin } from "@/components/admin/CollectionAdmin";
import { PogAdmin } from "@/components/admin/PogAdmin";
import { ImportPanel } from "@/components/admin/ImportPanel";
import type { Collection, PogWithOwnership } from "@/types";

type Tab = "collections" | "pogs" | "import";

export function AdminPanel({
  collections,
  pogs,
}: {
  collections: Collection[];
  pogs: PogWithOwnership[];
}) {
  const [tab, setTab] = React.useState<Tab>("collections");

  const tabs: { key: Tab; label: string }[] = [
    { key: "collections", label: `Kolekcie (${collections.length})` },
    { key: "pogs", label: `POG predmety (${pogs.length})` },
    { key: "import", label: "CSV Import" },
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-lg border p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "collections" && <CollectionAdmin collections={collections} />}
      {tab === "pogs" && (
        <PogAdmin collections={collections} pogs={pogs} />
      )}
      {tab === "import" && <ImportPanel />}
    </div>
  );
}
