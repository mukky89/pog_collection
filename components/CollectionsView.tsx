"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { CollectionCard } from "@/components/CollectionCard";
import type { CollectionWithStats } from "@/types";

export function CollectionsView({
  collections,
}: {
  collections: CollectionWithStats[];
}) {
  const [year, setYear] = React.useState("");
  const [manufacturer, setManufacturer] = React.useState("");
  const [status, setStatus] = React.useState("");

  const years = React.useMemo(
    () =>
      Array.from(new Set(collections.map((c) => c.year)))
        .sort((a, b) => b - a)
        .map(String),
    [collections]
  );
  const manufacturers = React.useMemo(
    () =>
      Array.from(
        new Set(collections.map((c) => c.manufacturer).filter(Boolean))
      ).sort(),
    [collections]
  );

  const filtered = collections.filter((c) => {
    if (year && String(c.year) !== year) return false;
    if (manufacturer && c.manufacturer !== manufacturer) return false;
    if (status === "complete" && c.completeness < 100) return false;
    if (status === "incomplete" && c.completeness >= 100) return false;
    if (status === "started" && c.ownedCount === 0) return false;
    if (status === "empty" && c.ownedCount > 0) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-3">
        <Select
          className="w-auto min-w-[120px]"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Každý rok</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <Select
          className="w-auto min-w-[160px]"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        >
          <option value="">Každý výrobca</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Select
          className="w-auto min-w-[160px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Každý stav</option>
          <option value="complete">Kompletné (100 %)</option>
          <option value="incomplete">Nekompletné</option>
          <option value="started">Rozbehnuté</option>
          <option value="empty">Nezačaté</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          Žiadne kolekcie nezodpovedajú filtru.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CollectionCard key={c._id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
