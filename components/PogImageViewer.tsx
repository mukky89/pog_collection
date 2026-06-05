"use client";

import * as React from "react";
import Image from "next/image";
import { cn, RARITY_RING } from "@/lib/utils";

export function PogImageViewer({
  front,
  back,
  alt,
  rarity = "common",
}: {
  front: string;
  back?: string;
  alt: string;
  rarity?: string;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const hasBack = Boolean(back);

  const faceClass = cn(
    "pog-face overflow-hidden rounded-full border-4 border-card bg-secondary ring-4 ring-offset-4 ring-offset-background",
    RARITY_RING[rarity]
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "pog-coin relative mx-auto aspect-square w-full max-w-md",
          hasBack && "cursor-pointer"
        )}
        onClick={() => hasBack && setFlipped((f) => !f)}
        role={hasBack ? "button" : undefined}
        aria-label={hasBack ? "Preklopiť POG" : undefined}
      >
        <div className={cn("pog-coin-inner", flipped && "is-flipped")}>
          <div className={faceClass}>
            <Image
              src={front || "/placeholder-pog.svg"}
              alt={`${alt} — predná strana`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              priority
            />
          </div>
          {hasBack && (
            <div className={cn(faceClass, "pog-face-back")}>
              <Image
                src={back!}
                alt={`${alt} — zadná strana`}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {hasBack && (
        <div className="flex justify-center gap-3">
          {[front, back!].map((img, i) => (
            <button
              key={i}
              onClick={() => setFlipped(i === 1)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-full border-4 bg-secondary transition-transform hover:scale-105",
                (i === 1) === flipped ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={img}
                alt={`${alt} ${i === 0 ? "predná" : "zadná"}`}
                fill
                sizes="64px"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/55 text-center text-[10px] font-bold text-white">
                {i === 0 ? "Predná" : "Zadná"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
