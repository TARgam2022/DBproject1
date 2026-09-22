"use client";
import React, { useEffect, useState } from "react";
import { Category } from "@/types/category";
import { CATEGORY_COLORS, getCategoryColor } from "@/config/category-colors";

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories ?? []);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name.trim(), color }),
      });
      const data = await res.json();
      if (res.ok) {
        setName("");
        setColor("blue");
        setCategories((prev) => [...prev, data.category]);
        setMessage("Category added successfully!");
      } else {
        setMessage(data.error ?? "Failed to add category");
      }
    } catch {
      setMessage("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category? Products will keep their other categories.")) return;
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setMessage("Category deleted successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Failed to delete category");
      }
    } catch {
      setMessage("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <h3 className="font-medium text-xl text-dark mb-5">Categories</h3>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-5">
          <label htmlFor="categoryName" className="block mb-2.5">
            Category Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Category name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2.5">Color</label>
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORY_COLORS.map((c) => (
              <button
                type="button"
                key={c.key}
                onClick={() => setColor(c.key)}
                aria-label={c.label}
                title={c.label}
                className={`w-9 h-9 rounded-full border-2 ease-out duration-200 ${
                  color === c.key
                    ? "border-dark-4 scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.bg }}
              />
            ))}
          </div>
        </div>

        {name.trim() && (
          <div className="flex items-center gap-3 mb-5">
            <span className="font-medium text-custom-sm text-dark mr-1">
              Preview:
            </span>
            <CategoryChip category={{ id: 0, title: name, color }} showColor />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
        {message && (
          <p
            className={`mt-3 text-custom-sm ${
              message.includes("success") ? "text-green" : "text-red"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <h4 className="font-medium text-lg text-dark mb-4">Existing Categories</h4>
      {!loaded ? (
        <p className="text-dark-5 text-custom-sm">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-dark-5 text-custom-sm">No categories yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between gap-4 border border-gray-3 rounded-md py-3 px-5"
            >
              <CategoryChip category={cat} showColor />
              <div className="flex items-center gap-3">
                <span className="text-custom-xs text-dark-5">#{cat.id}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="inline-flex items-center gap-1 font-medium text-red text-custom-xs ease-out duration-200 hover:underline disabled:opacity-50"
                >
                  {deletingId === cat.id ? "Deleting..." : "Remove"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export function CategoryChip({
  category,
  showColor = false,
}: {
  category: { id?: number; title: string; color?: string };
  showColor?: boolean;
}) {
  const c = category.color ? getCategoryColor(category.color) : null;
  const style = c
    ? { backgroundColor: c.bg, color: c.text }
    : undefined;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-custom-xs font-medium py-1 px-3"
      style={style}
    >
      {showColor && category.color && (
        <CategoryColorDot color={category.color} />
      )}
      {category.title}
    </span>
  );
}

export function CategoryColorDot({ color }: { color: string }) {
  const c = getCategoryColor(color);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: c.text }}
    />
  );
}

export default CategoriesManager;
