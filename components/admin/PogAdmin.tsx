"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Loader2, Check } from "lucide-react";
import type { Collection, PogWithOwnership } from "@/types";

export function PogAdmin({
  collections,
  pogs,
}: {
  collections: Collection[];
  pogs: PogWithOwnership[];
}) {
  const router = useRouter();
  const emptyForm = {
    name: "",
    collectionId: collections[0]?._id ?? "",
    number: "",
    rarity: "common",
    price: "",
    imageUrl: "",
    imageBackUrl: "",
    description: "",
    tags: "",
  };
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.collectionId) {
      setError("Najprv vytvor aspoň jednu kolekciu.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/pogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          collectionId: form.collectionId,
          number: Number(form.number) || 0,
          rarity: form.rarity,
          price: form.price
            ? Math.round(parseFloat(form.price.replace(",", ".")) * 100)
            : 0,
          imageUrl: form.imageUrl || undefined,
          imageBackUrl: form.imageBackUrl || undefined,
          description: form.description || undefined,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Vytvorenie zlyhalo");
      }
      setForm({ ...emptyForm, collectionId: form.collectionId });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Naozaj zmazať tento POG?")) return;
    await fetch(`/api/pogs/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nový POG predmet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Select
              value={form.collectionId}
              onChange={(e) =>
                setForm({ ...form, collectionId: e.target.value })
              }
            >
              {collections.length === 0 && (
                <option value="">Žiadna kolekcia</option>
              )}
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Názov *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Číslo"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Cena (€)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <Select
              value={form.rarity}
              onChange={(e) => setForm({ ...form, rarity: e.target.value })}
            >
              <option value="common">Bežný</option>
              <option value="uncommon">Menej bežný</option>
              <option value="rare">Vzácny</option>
              <option value="ultra-rare">Ultra vzácny</option>
            </Select>
            <Input
              placeholder="URL prednej strany"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <Input
              placeholder="URL zadnej strany"
              value={form.imageBackUrl}
              onChange={(e) =>
                setForm({ ...form, imageBackUrl: e.target.value })
              }
            />
            <Input
              placeholder="Tagy (oddelené čiarkou)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <Textarea
              placeholder="Popis"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Pridať POG
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existujúce POG predmety</CardTitle>
        </CardHeader>
        <CardContent>
          {pogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Zatiaľ žiadne POG predmety.
            </p>
          ) : (
            <div className="divide-y">
              {pogs.map((p) => (
                <PogRow key={p._id} pog={p} onDelete={() => remove(p._id)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PogRow({
  pog,
  onDelete,
}: {
  pog: PogWithOwnership;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [price, setPrice] = React.useState((pog.price / 100).toFixed(2));
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const dirty = Math.round(parseFloat(price.replace(",", ".")) * 100) !== pog.price;

  async function savePrice() {
    setSaving(true);
    try {
      await fetch(`/api/pogs/${pog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Math.round(parseFloat(price.replace(",", ".")) * 100),
        }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          #{pog.number} {pog.name}
        </p>
        <p className="text-xs text-muted-foreground">{pog.rarity}</p>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9 w-24"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={!dirty || saving}
          onClick={savePrice}
          title={`Aktuálne ${formatPrice(pog.price)}`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className={saved ? "h-4 w-4 text-emerald-600" : "h-4 w-4"} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
