"use client";
import React, { useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeAllItemsFromWishlist, addItemToWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import { useAuth } from "@/app/context/AuthContext";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          dispatch(removeAllItemsFromWishlist());
          data.items.forEach((item: any) => {
            dispatch(addItemToWishlist({
              id: item.productId,
              title: item.title,
              price: item.price,
              discountedPrice: item.discountedPrice,
              quantity: 1,
              status: "available",
              imgs: item.imgs,
            }));
          });
        }
      })
      .catch(() => {});
  }, [user, dispatch]);

  const handleClear = async () => {
    for (const item of wishlistItems) {
      if (user) {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.id }),
        });
      }
    }
    dispatch(removeAllItemsFromWishlist());
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
            <button onClick={handleClear} className="text-blue">Clear Wishlist Cart</button>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-dark">Product</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-dark">Unit Price</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-dark">Stock Status</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-dark text-right">Action</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
