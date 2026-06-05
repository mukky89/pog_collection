"use client";

import * as React from "react";
import { PogGrid } from "@/components/PogGrid";
import { cn } from "@/lib/utils";
import type { PogWithOwnership } from "@/types";

type Tab = "all" | "owned" | "missing";

export function OwnershipTabs({ pogs }: { pogs: PogWithOwnership[] }) {
  const [tab, setTab] = React.useState<Tab>("all");

  const counts = {
    all: pogs.length,
    owned: pogs.filter((p) => p.isOwned).length,
    missing: pogs.filter((p) => !p.isOwned).length,
  };

  const filtered =
    tab === "owned"
      ? pogs.filter((p) => p.isOwned)
      : tab === "missing"
        ? pogs.filter((p) => !p.isOwned)
        : pogs;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Všetky" },
    { key: "owned", label: "Vlastním" },
    { key: "missing", label: "Chýba mi" },
  ];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border p-1">
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
            {t.label}{" "}
            <span className="opacity-70">({counts[t.key]})</span>
          </button>
        ))}
      </div>
      <PogGrid pogs={filtered} toggleView={false} />
    </div>
  );
}
