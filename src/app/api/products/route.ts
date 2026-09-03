import { NextRequest, NextResponse } from "next/server";
import { productDB } from "@/db/product-db";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const products = await productDB.getAll();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[api/products] GET failed", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
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
    const user = await userDB.findById(payload.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, price, reviews, discountedPrice, thumbnail, preview, categoryId, description } =
      body ?? {};

    if (!title || typeof price !== "number") {
      return NextResponse.json(
        { error: "title (string) and price (number) are required" },
        { status: 400 }
      );
    }

    const product = await productDB.add({
      title: String(title),
      price: Number(price),
      reviews: reviews == null ? 0 : Number(reviews),
      discountedPrice:
        discountedPrice == null ? Number(price) : Number(discountedPrice),
      thumbnail: thumbnail ?? null,
      preview: preview ?? thumbnail ?? null,
      categoryId: categoryId == null ? null : Number(categoryId),
      description: description ?? null,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[api/products] POST failed", err);
    return NextResponse.json(
      { error: "Failed to register product" },
      { status: 500 }
    );
  }
}
