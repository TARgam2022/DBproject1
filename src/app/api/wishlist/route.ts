import { NextRequest, NextResponse } from "next/server";
import { wishlistDB } from "@/db/wishlist-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

async function getUserId(request: NextRequest): Promise<number | null> {
  const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ items: [] });
    }
    const items = await wishlistDB.getByUser(userId);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[api/wishlist] GET failed", err);
    return NextResponse.json({ error: "Failed to load wishlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body ?? {};

    if (typeof productId !== "number") {
      return NextResponse.json({ error: "productId (number) is required" }, { status: 400 });
    }

    const item = await wishlistDB.add(userId, productId);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[api/wishlist] POST failed", err);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body ?? {};

    if (typeof productId !== "number") {
      return NextResponse.json({ error: "productId (number) is required" }, { status: 400 });
    }

    await wishlistDB.remove(userId, productId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/wishlist] DELETE failed", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
