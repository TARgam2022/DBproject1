"use client";
import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { selectCartItems, setCartItems } from "@/redux/features/cart-slice";
import { useAuth } from "@/app/context/AuthContext";

type CartItemData = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export function useCartSync() {
  const items = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const restored = useRef(false);

  useEffect(() => {
    if (!user) return;
    restored.current = false;
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data: { items?: CartItemData[] }) => {
        restored.current = true;
        if (Array.isArray(data.items) && data.items.length) {
          dispatch(setCartItems(data.items));
        } else if (items.length) {
          fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          }).catch(() => {});
        }
      })
      .catch(() => {
        restored.current = true;
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user || !restored.current) return;
    const timer = setTimeout(() => {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [items, user]);
}
