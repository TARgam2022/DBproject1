"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

type OrderItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
};

type Order = {
  id: number;
  orderId: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  const orderItems = orders.map((order) => ({
    orderId: order.orderId,
    createdAt: order.createdAt,
    status: order.status,
    total: `$${order.total.toFixed(2)}`,
    title: order.items.map((i) => i.title).join(", ") || "Order",
  }));

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {orderItems.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Status</p>
              </div>
              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Items</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
            </div>
          )}
          {orderItems.length > 0 ? (
            orderItems.map((orderItem, key) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              You don&apos;t have any orders yet!
            </p>
          )}
        </div>

        {orderItems.length > 0 &&
          orderItems.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
