"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Collection } from "@/types";

interface FilterBarProps {
  collections: Pick<Collection, "_id" | "name">[];
  showCollectionFilter?: boolean;
}

export function FilterBar({
  collections,
  showCollectionFilter = true,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = React.useState(params.get("search") ?? "");

  const update = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  // Debounce vyhľadávania
  React.useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("search") ?? "") !== search) update("search", search);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters =
    params.get("search") ||
    params.get("collectionId") ||
    params.get("rarity") ||
    params.get("owned") ||
    params.get("sort");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hľadať podľa názvu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {showCollectionFilter && (
        <Select
          className="w-auto min-w-[160px]"
          value={params.get("collectionId") ?? ""}
          onChange={(e) => update("collectionId", e.target.value)}
        >
          <option value="">Všetky série</option>
          {collections.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      <Select
        className="w-auto min-w-[140px]"
        value={params.get("rarity") ?? ""}
        onChange={(e) => update("rarity", e.target.value)}
      >
        <option value="">Každá vzácnosť</option>
        <option value="common">Bežný</option>
        <option value="uncommon">Menej bežný</option>
        <option value="rare">Vzácny</option>
        <option value="ultra-rare">Ultra vzácny</option>
      </Select>

      <Select
        className="w-auto min-w-[130px]"
        value={params.get("owned") ?? ""}
        onChange={(e) => update("owned", e.target.value)}
      >
        <option value="">Všetky</option>
        <option value="owned">Vlastním</option>
        <option value="missing">Chýba mi</option>
      </Select>

      <Select
        className="w-auto min-w-[150px]"
        value={params.get("sort") ?? ""}
        onChange={(e) => update("sort", e.target.value)}
      >
        <option value="">Triediť: číslo</option>
        <option value="name">Názov (A–Z)</option>
        <option value="price">Cena ↑</option>
        <option value="-price">Cena ↓</option>
        <option value="rarity">Vzácnosť</option>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            router.push(pathname);
          }}
        >
          <X className="h-4 w-4" />
          Zrušiť
        </Button>
      )}
    </div>
  );
}
