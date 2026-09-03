"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import {
  selectCartItems,
  selectTotalPrice,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const Checkout = () => {
  const items = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/signin");
      return;
    }

    if (items.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total: totalPrice }),
      });
      if (res.ok) {
        dispatch(removeAllItemsFromCart());
        router.push("/my-account/orders");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleCheckout}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* checkout left */}
              <div className="lg:max-w-[670px] w-full">
                {!user && (
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5">
                    <p className="text-dark">
                      Please{" "}
                      <a href="/signin" className="text-blue underline">
                        sign in
                      </a>{" "}
                      to complete your order.
                    </p>
                  </div>
                )}

                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-dark mb-5">
                    Shipping Address
                  </h3>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="name" className="block mb-2.5">
                        Full Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={user?.name ?? ""}
                        placeholder="Your name"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="email" className="block mb-2.5">
                        Email <span className="text-red">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        defaultValue={user?.email ?? ""}
                        placeholder="Email address"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label htmlFor="address" className="block mb-2.5">
                      Address <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      placeholder="Street address"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                    <div className="w-full">
                      <label htmlFor="city" className="block mb-2.5">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        placeholder="City"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="zip" className="block mb-2.5">
                        ZIP / Postal
                      </label>
                      <input
                        type="text"
                        name="zip"
                        id="zip"
                        placeholder="ZIP code"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* checkout right */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-5 border-b border-gray-3"
                      >
                        <div>
                          <p className="text-dark">
                            {item.title} x {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            ${(item.discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !user || items.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!user
                    ? "Sign in to Checkout"
                    : loading
                    ? "Processing..."
                    : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
