"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";

const SAMPLE = `name,collection,number,rarity,price,imageUrl,description,tags
Slammer Gold,World POG Federation,1,ultra-rare,49.99,,Zlatý slammer,kov;limitka
POG #2,World POG Federation,2,common,0.50,,,
Ranger Red,Mighty Morphin Power Rangers,1,rare,12.00,,Červený ranger,seriál`;

export function ImportPanel() {
  const router = useRouter();
  const [csv, setCsv] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  }

  async function submit() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import zlyhal");
      setResult(data);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hromadný import cez CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">
            Stĺpce: name, collection, number, rarity, price (€), imageUrl,
            imageBackUrl, description, tags (oddelené `;`)
          </p>
          <p>
            Kolekcia sa automaticky vytvorí, ak ešte neexistuje. Cena sa zadáva
            v eurách. Opakovaný import rovnakých POG-ov (kolekcia + názov +
            číslo) ich <strong>aktualizuje</strong>, nevytvára duplikáty.
          </p>
        </div>

        <Input type="file" accept=".csv,text/csv" onChange={handleFile} />

        <Textarea
          placeholder="Vlož CSV obsah sem..."
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="min-h-[180px] font-mono text-xs"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} disabled={loading || !csv.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Importovať
          </Button>
          <Button variant="outline" onClick={() => setCsv(SAMPLE)}>
            Vložiť ukážkové dáta
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
            <p className="font-medium text-emerald-700">
              Importovaných {result.imported} POG predmetov
              {result.createdCollections > 0 &&
                `, vytvorených ${result.createdCollections} kolekcií`}
              .
            </p>
            {result.errors?.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-destructive">
                {result.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
