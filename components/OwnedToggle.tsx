"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OwnedToggleProps {
  pogId: string;
  initialOwned: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

/**
 * Client component — prepína stav vlastníctva POG-u s optimistickou
 * aktualizáciou UI a následným API requestom.
 */
export function OwnedToggle({
  pogId,
  initialOwned,
  size = "default",
  className,
}: OwnedToggleProps) {
  const router = useRouter();
  const [owned, setOwned] = React.useState(initialOwned);
  const [pending, setPending] = React.useState(false);

  async function toggle() {
    const next = !owned;
    setOwned(next); // optimistická aktualizácia
    setPending(true);
    try {
      const res = await fetch(`/api/owned/${pogId}`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Request zlyhal");
      router.refresh();
    } catch (e) {
      setOwned(!next); // rollback
      console.error(e);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={owned ? "default" : "outline"}
      onClick={toggle}
      disabled={pending}
      className={cn(
        owned &&
          "bg-emerald-500 shadow-[0_4px_0_0_#0a7a52] hover:bg-emerald-500 hover:brightness-105 active:shadow-[0_1px_0_0_#0a7a52]",
        className
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : owned ? (
        <Check className="h-4 w-4 animate-bounce-in" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {owned ? "Mám ho!" : "Chýba mi"}
    </Button>
  );
}
