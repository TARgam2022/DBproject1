import { NextRequest, NextResponse } from "next/server";
import { productDB } from "@/db/product-db";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

async function requireAdmin(request: NextRequest) {
  const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const payload = await verifyToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const user = await userDB.findById(payload.userId);
  if (!user || user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productDB.getById(Number(id));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[api/products/[id]] GET failed", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(request);
    if ("error" in adminCheck) return adminCheck.error;

    const { id } = await params;
    const body = await request.json();
    const { title, price, reviews, discountedPrice, thumbnail, preview, categoryId, description } = body ?? {};

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = String(title);
    if (price !== undefined) updates.price = Number(price);
    if (reviews !== undefined) updates.reviews = Number(reviews);
    if (discountedPrice !== undefined) updates.discountedPrice = Number(discountedPrice);
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (preview !== undefined) updates.preview = preview;
    if (description !== undefined) updates.description = description;
    if (categoryId !== undefined) updates.categoryId = categoryId == null ? null : Number(categoryId);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const product = await productDB.update(Number(id), updates);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[api/products/[id]] PUT failed", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin(request);
    if ("error" in adminCheck) return adminCheck.error;

    const { id } = await params;
    const deleted = await productDB.delete(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/products/[id]] DELETE failed", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
