import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await userDB.getOrdersByUser(payload.userId);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[api/orders] GET failed", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, total } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items (array) is required" }, { status: 400 });
    }

    if (typeof total !== "number" || total < 0) {
      return NextResponse.json({ error: "total (number) is required" }, { status: 400 });
    }

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

    const order = await userDB.createOrder({
      userId: payload.userId,
      orderId,
      total,
      items,
    });

    await userDB.saveCart(payload.userId, []);

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("[api/orders] POST failed", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
