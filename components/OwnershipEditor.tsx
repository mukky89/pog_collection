"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OwnedToggle } from "@/components/OwnedToggle";
import { Loader2, Save, Plus, Minus } from "lucide-react";
import type { UserCollection } from "@/types";

export function OwnershipEditor({
  pogId,
  isOwned,
  ownership,
}: {
  pogId: string;
  isOwned: boolean;
  ownership: UserCollection | null;
}) {
  const router = useRouter();
  const [condition, setCondition] = React.useState(ownership?.condition ?? "");
  const [paidPrice, setPaidPrice] = React.useState(
    ownership?.paidPrice != null ? (ownership.paidPrice / 100).toFixed(2) : ""
  );
  const [acquiredDate, setAcquiredDate] = React.useState(
    ownership?.acquiredDate ? ownership.acquiredDate.slice(0, 10) : ""
  );
  const [notes, setNotes] = React.useState(ownership?.notes ?? "");
  const [quantity, setQuantity] = React.useState(ownership?.quantity ?? 1);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/owned/${pogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owned: true,
          quantity: Math.max(1, Math.round(quantity) || 1),
          condition: condition || undefined,
          paidPrice: paidPrice
            ? Math.round(parseFloat(paidPrice.replace(",", ".")) * 100)
            : undefined,
          acquiredDate: acquiredDate || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Uloženie zlyhalo");
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Stav vlastníctva</span>
        <OwnedToggle pogId={pogId} initialOwned={isOwned} size="sm" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">
            Počet kusov (duplikáty)
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Znížiť počet"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min="1"
              step="1"
              className="w-20 text-center"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Zvýšiť počet"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {quantity > 1 ? `mám ${quantity} kusy/kusov` : "mám 1 kus"}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Podmienka</label>
          <Select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">—</option>
            <option value="mint">Perfektný</option>
            <option value="good">Dobrý</option>
            <option value="fair">Priemerný</option>
            <option value="poor">Slabý</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Zaplatená cena (€)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={paidPrice}
            onChange={(e) => setPaidPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">
            Dátum získania
          </label>
          <Input
            type="date"
            value={acquiredDate}
            onChange={(e) => setAcquiredDate(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Poznámky</label>
          <Textarea
            placeholder="Voliteľné poznámky..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Uložené!" : "Uložiť detaily"}
      </Button>
    </div>
  );
}
