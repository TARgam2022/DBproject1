import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getCookieValue(
      AUTH_COOKIE_NAME,
      request.headers.get("cookie")
    );
    if (!token) {
      return NextResponse.json({ items: [] });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ items: [] });
    }
    const items = await userDB.getCart(payload.userId);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[api/cart] GET failed", err);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCookieValue(
      AUTH_COOKIE_NAME,
      request.headers.get("cookie")
    );
    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in to save your cart" },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "You must be signed in to save your cart" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    await userDB.saveCart(payload.userId, items);

    const saved = await userDB.getCart(payload.userId);
    return NextResponse.json({ items: saved });
  } catch (err) {
    console.error("[api/cart] POST failed", err);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
