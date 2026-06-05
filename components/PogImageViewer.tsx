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
  const images = [front, back].filter(Boolean) as string[];
  const [active, setActive] = React.useState(0);

  return (
    <div className="space-y-4">
      <div className="pog-flip group relative mx-auto aspect-square w-full max-w-md">
        <div
          className={cn(
            "pog-flip-inner relative h-full w-full overflow-hidden rounded-full border-4 border-card bg-secondary ring-4 ring-offset-4 ring-offset-background",
            RARITY_RING[rarity]
          )}
        >
          <Image
            src={images[active] || "/placeholder-pog.svg"}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            priority
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-full border-4 bg-secondary transition-transform hover:scale-105",
                active === i ? "border-primary" : "border-transparent"
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
