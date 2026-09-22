"use client";
import React, { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { getCategoryColor } from "@/config/category-colors";

let cache: Category[] | null = null;
let inFlight: Promise<Category[]> | null = null;

function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (!inFlight) {
    inFlight = fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        cache = d.categories ?? [];
        inFlight = null;
        return cache;
      })
      .catch(() => {
        inFlight = null;
        return [] as Category[];
      });
  }
  return inFlight;
}

export default function CategoryChipById({
  categoryId,
  categoryIds,
}: {
  categoryId?: number | null;
  categoryIds?: number[];
}) {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);

  useEffect(() => {
    if (categories.length > 0) return;
    loadCategories().then(setCategories);
  }, [categories.length]);

  const ids = (categoryIds?.length
    ? categoryIds
    : typeof categoryId === "number" && categoryId > 0
      ? [categoryId]
      : [])
    .map(Number)
    .filter((n) => n > 0);

  const matches = ids
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c));

  if (matches.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {matches.map((category) => {
        const c = getCategoryColor(category.color);
        return (
          <span
            key={category.id}
            className="inline-flex items-center rounded-full text-custom-xs font-medium py-1 px-3"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            {category.title}
          </span>
        );
      })}
    </div>
  );
}
