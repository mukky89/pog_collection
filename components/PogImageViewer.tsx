"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PogImageViewer({
  front,
  back,
  alt,
}: {
  front: string;
  back?: string;
  alt: string;
}) {
  const images = [front, back].filter(Boolean) as string[];
  const [active, setActive] = React.useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-secondary">
        <Image
          src={images[active] || "/placeholder-pog.svg"}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border-2 bg-secondary",
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
