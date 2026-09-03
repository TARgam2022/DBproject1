"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";

export default function EditProductForm({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (res.ok && data.product) {
          const p = data.product as Product;
          setProduct(p);
          setTitle(p.title);
          setPrice(String(p.price));
          setDiscountedPrice(
            p.discountedPrice !== p.price ? String(p.discountedPrice) : ""
          );
          setCategoryId(p.categoryId != null ? String(p.categoryId) : "");
          setThumbnail(p.imgs?.thumbnails?.[0] ?? "");
          setDescription(p.description ?? "");
        } else {
          setMessage("Product not found");
        }
      } catch {
        setMessage("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {};
      if (title) body.title = title;
      if (price) body.price = Number(price);
      if (discountedPrice) body.discountedPrice = Number(discountedPrice);
      else body.discountedPrice = Number(price);
      if (categoryId) body.categoryId = Number(categoryId);
      else body.categoryId = null;
      if (thumbnail) body.thumbnail = thumbnail;
      if (description) body.description = description;

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Product updated successfully!");
        if (data.product) setProduct(data.product);
      } else {
        setMessage(data.error ?? "Failed to update product");
      }
    } catch {
      setMessage("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
        <p className="text-dark-5">Loading product...</p>
      </div>
    );
  }

  if (!product && message) {
    return (
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
        <p className="text-red text-custom-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <h3 className="font-medium text-xl text-dark mb-5">
        Edit Product #{productId}
      </h3>
      {message && (
        <p
          className={`mb-5 text-custom-sm ${
            message.includes("success") ? "text-green" : "text-red"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="editTitle" className="block mb-2.5">
            Product Title <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="editTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Product name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="editPrice" className="block mb-2.5">
              Price <span className="text-red">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="editPrice"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="w-full">
            <label htmlFor="editDiscounted" className="block mb-2.5">
              Discounted Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="editDiscounted"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="0.00 (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="editCategory" className="block mb-2.5">
              Category ID
            </label>
            <input
              type="number"
              min="0"
              id="editCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Optional"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="w-full">
            <label htmlFor="editThumbnail" className="block mb-2.5">
              Thumbnail URL
            </label>
            <input
              type="text"
              id="editThumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://... (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>
        <div className="mb-5">
          <label htmlFor="editDescription" className="block mb-2.5">
            Description
          </label>
          <textarea
            id="editDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Product description (optional)"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
