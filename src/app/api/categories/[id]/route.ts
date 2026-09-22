import { NextRequest, NextResponse } from "next/server";
import { categoryDB } from "@/db/category-db";
import { productDB } from "@/db/product-db";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const deleted = await categoryDB.delete(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await productDB.removeCategory(Number(id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/categories/[id]] DELETE failed", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
