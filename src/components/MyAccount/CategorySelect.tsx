"use client";
import React, { useEffect, useRef, useState } from "react";
import { Category } from "@/types/category";
import { getCategoryColor } from "@/config/category-colors";

export default function CategorySelect({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectedCats = categories.filter((c) => value.includes(c.id));

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const remove = (id: number) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className="relative" ref={ref}>
      {/* selected chips */}
      {selectedCats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {selectedCats.map((c) => {
            const col = getCategoryColor(c.color);
            return (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full text-custom-xs font-medium py-1 px-3"
                style={{ backgroundColor: col.bg, color: col.text }}
              >
                <CategoryColorDot color={c.color} />
                {c.title}
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="ml-1 opacity-60 hover:opacity-100"
                  aria-label={`Remove ${c.title}`}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* dropdown trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-gray-3 bg-gray-1 py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-left"
      >
        <span className={selectedCats.length > 0 ? "text-dark" : "text-dark-5"}>
          {selectedCats.length > 0
            ? `${selectedCats.length} categor${selectedCats.length === 1 ? "y" : "ies"} selected`
            : "Select categories (optional)"}
        </span>
        <svg
          className={`fill-current text-dark-4 min-w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.64645 5.64645C4.84171 5.45118 5.15829 5.45118 5.35355 5.64645L8 8.29289L10.6464 5.64645C10.8417 5.45118 11.1583 5.45118 11.3536 5.64645C11.5488 5.84171 11.5488 6.15829 11.3536 6.35355L8.35355 9.35355C8.15829 9.54882 7.84171 9.54882 7.64645 9.35355L4.64645 6.35355C4.45118 6.15829 4.45118 5.84171 4.64645 5.64645Z"
            fill=""
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-3 rounded-md shadow-1 max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`w-full text-left py-2.5 px-5 text-custom-sm text-dark-5 hover:bg-gray-2 ease-out duration-200 ${
              value.length === 0 ? "bg-gray-2" : ""
            }`}
          >
            No categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`w-full flex items-center gap-2.5 py-2.5 px-5 text-custom-sm hover:bg-gray-2 ease-out duration-200 ${
                value.includes(c.id) ? "bg-gray-2" : ""
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: getCategoryColor(c.color).text }}
              />
              <span className="truncate text-dark flex-1 text-left">{c.title}</span>
              {value.includes(c.id) && (
                <svg className="w-4 h-4 text-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryColorDot({ color }: { color: string }) {
  const c = getCategoryColor(color);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: c.text }}
    />
  );
}
