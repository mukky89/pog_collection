"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import type { Collection } from "@/types";

const empty = {
  name: "",
  description: "",
  year: new Date().getFullYear(),
  manufacturer: "",
  coverImage: "",
};

export function CollectionAdmin({
  collections,
}: {
  collections: Collection[];
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({ ...empty });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Vytvorenie zlyhalo");
      }
      setForm({ ...empty });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Naozaj zmazať kolekciu a všetky jej POG predmety?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nová kolekcia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <Input
              placeholder="Názov série *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              placeholder="Výrobca"
              value={form.manufacturer}
              onChange={(e) =>
                setForm({ ...form, manufacturer: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Rok"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: Number(e.target.value) })
              }
            />
            <Input
              placeholder="URL obrázka obalu"
              value={form.coverImage}
              onChange={(e) =>
                setForm({ ...form, coverImage: e.target.value })
              }
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
              Pridať kolekciu
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existujúce kolekcie</CardTitle>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Zatiaľ žiadne kolekcie.
            </p>
          ) : (
            <div className="divide-y">
              {collections.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.manufacturer} · {c.year}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(c._id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
