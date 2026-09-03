"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";

export default function ProductList({
  onEdit,
}: {
  onEdit?: (id: number) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setMessage("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setMessage("Product deleted successfully");
      } else {
        setMessage("Failed to delete product");
      }
    } catch {
      setMessage("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
        <p className="text-dark-5">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-xl text-dark">Manage Products</h3>
        <Link
          href="/my-account/add-product"
          className="inline-flex font-medium text-white bg-blue py-2 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark text-custom-sm"
        >
          Add New Product
        </Link>
      </div>

      {message && (
        <p
          className={`mb-5 text-custom-sm ${
            message.includes("success") || message.includes("deleted")
              ? "text-green"
              : "text-red"
          }`}
        >
          {message}
        </p>
      )}

      {products.length === 0 ? (
        <p className="text-dark-5">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-3">
                <th className="font-medium text-custom-sm text-dark pb-3 pr-4">
                  ID
                </th>
                <th className="font-medium text-custom-sm text-dark pb-3 pr-4">
                  Title
                </th>
                <th className="font-medium text-custom-sm text-dark pb-3 pr-4">
                  Price
                </th>
                <th className="font-medium text-custom-sm text-dark pb-3 pr-4">
                  Disc. Price
                </th>
                <th className="font-medium text-custom-sm text-dark pb-3 pr-4">
                  Category
                </th>
                <th className="font-medium text-custom-sm text-dark pb-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-3 last:border-0"
                >
                  <td className="py-3 pr-4 text-custom-sm text-dark-2">
                    {product.id}
                  </td>
                  <td className="py-3 pr-4 text-custom-sm text-dark">
                    {product.title}
                  </td>
                  <td className="py-3 pr-4 text-custom-sm text-dark-2">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-custom-sm text-dark-2">
                    ${product.discountedPrice.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-custom-sm text-dark-2">
                    {product.categoryId ?? "-"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit?.(product.id)}
                        className="text-blue text-custom-sm font-medium ease-out duration-200 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red text-custom-sm font-medium ease-out duration-200 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
