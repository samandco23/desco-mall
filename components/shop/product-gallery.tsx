"use client";

import { useState } from "react";
import Image from "next/image";

import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start md:gap-3">
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-paper-tint">
        {current && (
          <Image
            key={current.url}
            src={current.url}
            alt={current.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 560px"
            className="object-cover"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 md:w-[72px] md:flex-col">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Voir l'image ${index + 1} de ${name}`}
              aria-pressed={index === active}
              className={cn(
                "relative h-20 w-[72px] shrink-0 overflow-hidden rounded-sm border bg-paper-tint transition-colors",
                index === active ? "border-2 border-brand-black" : "border-ink-line hover:border-ink-faint"
              )}
            >
              <Image src={image.url} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
